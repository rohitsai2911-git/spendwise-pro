import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Download, ChevronDown, X,
  ArrowDownCircle, ArrowUpCircle, Edit3, Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { transactionApi } from '../api/auth';
import EmptyState from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

const EXPENSE_CATEGORIES = ['FOOD', 'SHOPPING', 'FUEL', 'MEDICAL', 'EDUCATION', 'ENTERTAINMENT', 'BILLS', 'TRAVEL', 'INVESTMENT', 'EMI', 'RENT', 'UTILITIES', 'OTHERS'];
const INCOME_SOURCES = ['SALARY', 'FREELANCING', 'BUSINESS', 'INVESTMENT', 'OTHERS'];
const PAYMENT_METHODS = ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'OTHERS'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const txnType = watch('type');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      if (typeFilter) params.type = typeFilter;
      const res = await transactionApi.getAll(params);
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openAdd = () => {
    setEditing(null);
    reset({ type: 'EXPENSE', amount: '', description: '', transactionDate: new Date().toISOString().split('T')[0], expenseCategory: 'OTHERS', paymentMethod: 'CASH', isRecurring: false });
    setShowAddModal(true);
  };

  const openEdit = (txn) => {
    setEditing(txn);
    reset({
      type: txn.type,
      amount: txn.amount,
      description: txn.description || '',
      transactionDate: txn.transactionDate,
      expenseCategory: txn.expenseCategory || 'OTHERS',
      incomeSource: txn.incomeSource || 'SALARY',
      paymentMethod: txn.paymentMethod || 'CASH',
      isRecurring: txn.isRecurring || false,
      notes: txn.notes || '',
    });
    setShowAddModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await transactionApi.update(editing.id, data);
        toast.success('Transaction updated');
      } else {
        await transactionApi.create(data);
        toast.success('Transaction created');
      }
      setShowAddModal(false);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionApi.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = format === 'csv' ? await transactionApi.exportCsv() : await transactionApi.exportPdf();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Transactions</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your income and expenses</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="input-field w-full sm:w-40"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary"><Download className="w-4 h-4" /> PDF</button>
        </div>
      </motion.div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={typeFilter === 'INCOME' ? ArrowUpCircle : ArrowDownCircle}
          title="No transactions found"
          description={search ? 'Try a different search term' : 'Add your first transaction to get started'}
          action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Transaction</button>}
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Type</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Description</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Category</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Payment</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Date</th>
                  <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Amount</th>
                  <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`badge ${txn.type === 'INCOME' ? 'badge-success' : 'badge-danger'}`}>{txn.type}</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-surface-900 dark:text-white">{txn.description || '-'}</td>
                    <td className="py-3 px-4 text-sm text-surface-500">{txn.expenseCategory || txn.incomeSource || '-'}</td>
                    <td className="py-3 px-4 text-sm text-surface-500">{txn.paymentMethod || '-'}</td>
                    <td className="py-3 px-4 text-sm text-surface-500">{txn.transactionDate}</td>
                    <td className={`py-3 px-4 text-sm font-semibold text-right ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {txn.type === 'INCOME' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(txn)} className="btn-ghost p-1.5"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(txn.id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
              <p className="text-sm text-surface-500">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm">Previous</button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm">Next</button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  {editing ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="label">Type</label>
                  <select {...register('type', { required: true })} className="input-field">
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>

                <div>
                  <label className="label">Amount</label>
                  <input type="number" step="0.01" {...register('amount', { required: true, min: 0.01 })} className="input-field" placeholder="0.00" />
                </div>

                <div>
                  <label className="label">Description</label>
                  <input type="text" {...register('description')} className="input-field" placeholder="What was this for?" />
                </div>

                <div>
                  <label className="label">Date</label>
                  <input type="date" {...register('transactionDate', { required: true })} className="input-field" />
                </div>

                {txnType === 'EXPENSE' && (
                  <div>
                    <label className="label">Category</label>
                    <select {...register('expenseCategory')} className="input-field">
                      {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {txnType === 'INCOME' && (
                  <div>
                    <label className="label">Source</label>
                    <select {...register('incomeSource')} className="input-field">
                      {INCOME_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label">Payment Method</label>
                  <select {...register('paymentMethod')} className="input-field">
                    {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register('isRecurring')} className="w-4 h-4 rounded border-surface-300 text-primary-600" />
                  <label className="text-sm text-surface-700 dark:text-surface-300">Recurring transaction</label>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea {...register('notes')} className="input-field" rows={2} placeholder="Optional notes..." />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
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
