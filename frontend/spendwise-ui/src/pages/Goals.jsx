import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { goalApi } from '../api/auth';
import EmptyState from '../components/common/EmptyState';
import { StatCardSkeleton } from '../components/common/LoadingSkeleton';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalApi.getAll();
      setGoals(res.data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', targetAmount: '', targetDate: '', icon: 'Target', color: '#3B82F6' });
    setShowModal(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    reset({ name: goal.name, targetAmount: goal.targetAmount, targetDate: goal.targetDate, icon: goal.icon, color: goal.color });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await goalApi.update(editing.id, data);
        toast.success('Goal updated');
      } else {
        await goalApi.create(data);
        toast.success('Goal created');
      }
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await goalApi.delete(id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    try {
      await goalApi.addProgress(showProgressModal.id, amount);
      toast.success('Progress added!');
      setShowProgressModal(null);
      fetchGoals();
    } catch (err) {
      toast.error('Failed to add progress');
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Goals</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Set and track your financial goals</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> New Goal</button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <StatCardSkeleton key={i} />)}</div>
      ) : goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals set" description="Create your first financial goal to start saving" action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create Goal</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, idx) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: goal.color + '20' }}>
                    <Target className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{goal.name}</h3>
                    <span className={`badge ${goal.status === 'COMPLETED' ? 'badge-success' : goal.status === 'CANCELLED' ? 'badge-danger' : 'badge-info'}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">{formatCurrency(goal.currentAmount)}</span>
                  <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(goal.progressPercent, 100)}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-surface-600">{Math.round(goal.progressPercent)}% complete</span>
                  {goal.targetDate && <span className="text-surface-500">Due: {goal.targetDate}</span>}
                </div>
              </div>

              <div className="flex gap-2">
                {goal.status !== 'COMPLETED' && (
                  <button onClick={() => setShowProgressModal(goal)} className="btn-secondary text-sm flex-1">
                    <TrendingUp className="w-4 h-4" /> Add Progress
                  </button>
                )}
                <button onClick={() => openEdit(goal)} className="btn-secondary text-sm px-3">Edit</button>
                <button onClick={() => handleDelete(goal.id)} className="btn-danger text-sm px-3">Del</button>
              </div>
            </motion.div>
          ))}
        </div>
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
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{editing ? 'Edit Goal' : 'New Goal'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"><X className="w-5 h-5 text-surface-500" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="label">Goal Name</label>
                  <input type="text" {...register('name', { required: true })} className="input-field" placeholder="e.g., Vacation Fund" />
                </div>
                <div>
                  <label className="label">Target Amount</label>
                  <input type="number" step="0.01" min="0.01" {...register('targetAmount', { required: true })} className="input-field" placeholder="10000" />
                </div>
                <div>
                  <label className="label">Target Date (Optional)</label>
                  <input type="date" {...register('targetDate')} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Icon</label>
                    <select {...register('icon')} className="input-field">
                      <option value="Target">Target</option>
                      <option value="PiggyBank">Savings</option>
                      <option value="Plane">Vacation</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Heart">Health</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <input type="color" {...register('color')} className="input-field h-10 p-1" />
                  </div>
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

      <AnimatePresence>
        {showProgressModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProgressModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl max-w-sm w-full p-6"
            >
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Add Progress</h2>
              <p className="text-sm text-surface-500 mb-4">How much have you saved for "{showProgressModal.name}"?</p>
              <form onSubmit={handleAddProgress} className="space-y-4">
                <input type="number" name="amount" step="0.01" min="0.01" className="input-field" placeholder="Amount" required />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowProgressModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Add</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
