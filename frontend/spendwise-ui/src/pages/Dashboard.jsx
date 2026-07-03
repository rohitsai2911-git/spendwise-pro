import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownCircle, ArrowUpCircle, Wallet, PiggyBank,
  TrendingUp, AlertTriangle, Plus,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import toast from 'react-hot-toast';
import { dashboardApi } from '../api/auth';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import { ChartSkeleton, StatCardSkeleton } from '../components/common/LoadingSkeleton';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.get();
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthBg = (score) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(value);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Your financial overview</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={loading ? '' : formatCurrency(data?.totalIncome || 0)}
          icon={ArrowUpCircle}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Monthly Expense"
          value={loading ? '' : formatCurrency(data?.totalExpense || 0)}
          icon={ArrowDownCircle}
          color="red"
          loading={loading}
        />
        <StatCard
          title="Remaining Balance"
          value={loading ? '' : formatCurrency(data?.remainingBalance || 0)}
          icon={Wallet}
          color="primary"
          loading={loading}
        />
        <StatCard
          title="Total Savings"
          value={loading ? '' : formatCurrency(data?.totalSavings || 0)}
          icon={PiggyBank}
          color="violet"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Income vs Expense Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyTrend || []}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={data?.monthlyTrend?.[0]?.value >= 0 ? '#10B981' : '#EF4444'}
                      fill={data?.monthlyTrend?.[0]?.value >= 0 ? 'url(#incomeGrad)' : 'url(#expenseGrad)'}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="card h-full">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Expense Categories</h3>
              {data?.expenseByCategory?.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.expenseByCategory.map((entry, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {data.expenseByCategory.slice(0, 5).map((cat, idx) => (
                      <div key={cat.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="text-surface-600 dark:text-surface-300">{cat.label}</span>
                        </div>
                        <span className="font-medium text-surface-900 dark:text-white">
                          {formatCurrency(cat.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState title="No expenses yet" description="Add your first expense to see category breakdown" />
              )}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Financial Health</h3>
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getHealthBg(data?.financialHealthScore || 0)} flex items-center justify-center mb-4`}>
                  <span className={`text-3xl font-bold text-white`}>{data?.financialHealthScore || 0}</span>
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                  Based on your income, expenses, savings rate, and goals progress
                </p>
                <div className="w-full mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-600 dark:text-surface-300">Budget Utilization</span>
                      <span className="font-medium text-surface-900 dark:text-white">{Math.round(data?.budgetUtilization || 0)}%</span>
                    </div>
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${Math.min(data?.budgetUtilization || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-600 dark:text-surface-300">Savings Rate</span>
                      <span className="font-medium text-surface-900 dark:text-white">
                        {data?.totalIncome > 0
                          ? Math.round(((data.totalIncome - data.totalExpense) / data.totalIncome) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${data?.totalIncome > 0
                            ? Math.min(((data.totalIncome - data.totalExpense) / data.totalIncome) * 100, 100)
                            : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Income vs Expense</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.incomeVsExpense || []} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {data?.incomeVsExpense?.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Transactions</h3>
            {data?.recentTransactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200 dark:border-surface-700">
                      <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Type</th>
                      <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Description</th>
                      <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Category</th>
                      <th className="text-left text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Date</th>
                      <th className="text-right text-xs font-medium text-surface-500 uppercase tracking-wider pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                    {data.recentTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                        <td className="py-3">
                          <span className={`badge ${txn.type === 'INCOME' ? 'badge-success' : 'badge-danger'}`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-medium text-surface-900 dark:text-white">
                          {txn.description || 'No description'}
                        </td>
                        <td className="py-3 text-sm text-surface-500">
                          {txn.expenseCategory || txn.incomeSource || '-'}
                        </td>
                        <td className="py-3 text-sm text-surface-500">{txn.transactionDate}</td>
                        <td className={`py-3 text-sm font-semibold text-right ${txn.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {txn.type === 'INCOME' ? '+' : '-'}${txn.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Start by adding your first income or expense"
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
