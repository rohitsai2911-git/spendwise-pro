import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, PiggyBank, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { budgetApi } from '../api/auth';
import EmptyState from '../components/common/EmptyState';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';
import StatCard from '../components/common/StatCard';

const CATEGORIES = ['FOOD', 'SHOPPING', 'FUEL', 'MEDICAL', 'EDUCATION', 'ENTERTAINMENT', 'BILLS', 'TRAVEL', 'INVESTMENT', 'EMI', 'RENT', 'UTILITIES', 'OTHERS'];

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const now = new Date();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetApi.getAll({ month: now.getMonth() + 1, year: now.getFullYear() });
      setBudgets(res.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openCreate = () => {
    setEditing(null);
    reset({ category: 'FOOD', month: now.getMonth() + 1, year: now.getFullYear(), budgetAmount: '', alertThreshold: 80 });
    setShowModal(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    reset({
      category: budget.category,
      month: budget.month,
      year: budget.year,
      budgetAmount: budget.budgetAmount,
      alertThreshold: budget.alertThreshold || 80,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await budgetApi.update(editing.id, data);
        toast.success('Budget updated');
      } else {
        await budgetApi.create(data);
        toast.success('Budget created');
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetApi.delete(id);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Budgets</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Set and track your monthly budgets</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create Budget</button>
      </motion.div>

      {!loading && budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-1">Utilization</p>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
            </p>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <StatCardSkeleton key={i} />)}</div>
      ) : budgets.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets set" description="Create your first budget to start tracking category-wise spending" action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create Budget</button>} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget, idx) => (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="badge-info">{budget.category}</span>
                  <p className="text-xs text-surface-500 mt-1">{budget.month}/{budget.year}</p>
                </div>
                {budget.isOverBudget && <AlertTriangle className="w-5 h-5 text-red-500" />}
                {budget.isAlertTriggered && !budget.isOverBudget && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">{formatCurrency(budget.spentAmount)} spent</span>
                  <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(budget.budgetAmount)}</span>
                </div>
                <div className="h-2.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budget.isOverBudget ? 'bg-red-500' : budget.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min(budget.utilizationPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${budget.isOverBudget ? 'text-red-600' : 'text-surface-500'}`}>
                    {Math.round(budget.utilizationPercent)}% used
                  </span>
                  <span className="text-surface-500">{formatCurrency(budget.remainingAmount)} remaining</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-surface-100 dark:border-surface-700">
                <button onClick={() => openEdit(budget)} className="btn-secondary text-sm flex-1">Edit</button>
                <button onClick={() => handleDelete(budget.id)} className="btn-danger text-sm px-3">Delete</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {editing ? 'Edit Budget' : 'New Budget'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="label">Category</label>
                  <select {...register('category', { required: true })} className="input-field">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Month</label>
                    <input type="number" min={1} max={12} {...register('month', { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Year</label>
                    <input type="number" min={2024} {...register('year', { required: true })} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Budget Amount</label>
                  <input type="number" step="0.01" min="0.01" {...register('budgetAmount', { required: true })} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Alert Threshold (%)</label>
                  <input type="number" min={1} max={100} {...register('alertThreshold')} className="input-field" placeholder="80" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
