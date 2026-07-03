import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { reportApi } from '../api/auth';
import EmptyState from '../components/common/EmptyState';
import { ChartSkeleton } from '../components/common/LoadingSkeleton';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

export default function Reports() {
  const [period, setPeriod] = useState('MONTHLY');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      const params = { year };
      if (period === 'MONTHLY') {
        params.month = month;
        res = await reportApi.monthly(params);
      } else if (period === 'YEARLY') {
        res = await reportApi.yearly(params);
      } else {
        params.month = month;
        params.day = 1;
        res = period === 'DAILY' ? await reportApi.daily(params) : await reportApi.weekly(params);
      }
      setData(res.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params = { period: period.toLowerCase(), year };
      if (period === 'MONTHLY') params.month = month;
      const res = await reportApi.download(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${period.toLowerCase()}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reports</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Analyze your financial data</p>
        </div>
        <button onClick={handleDownload} className="btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field">
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div>
          <label className="label">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="input-field w-24" />
        </div>
        {(period === 'MONTHLY' || period === 'DAILY' || period === 'WEEKLY') && (
          <div>
            <label className="label">Month</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="input-field">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
        )}
        <button onClick={fetchReport} className="btn-primary h-10">Generate Report</button>
      </motion.div>

      {!data && !loading && (
        <EmptyState icon={BarChart3} title="Generate a report" description="Select parameters and click Generate Report" />
      )}

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card"><p className="text-sm text-surface-500 mb-1">Total Income</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalIncome)}</p></div>
            <div className="card"><p className="text-sm text-surface-500 mb-1">Total Expense</p><p className="text-lg font-bold text-red-600">{formatCurrency(data.totalExpense)}</p></div>
            <div className="card"><p className="text-sm text-surface-500 mb-1">Net Savings</p><p className="text-lg font-bold text-surface-900 dark:text-white">{formatCurrency(data.netSavings)}</p></div>
            <div className="card"><p className="text-sm text-surface-500 mb-1">Savings Rate</p><p className="text-lg font-bold text-surface-900 dark:text-white">{data.savingsRate}%</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Category Breakdown</h3>
              {data.categoryChart?.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.categoryChart} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {data.categoryChart.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {data.categoryChart.map((cat, idx) => (
                      <div key={cat.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-surface-600 dark:text-surface-300">{cat.label}</span>
                        </div>
                        <span className="font-medium text-surface-900 dark:text-white">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="text-sm text-surface-500">No data for this period</p>}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Income vs Expense</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Income', value: data.totalIncome }, { name: 'Expense', value: data.totalExpense }]} barSize={80}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><span className="text-surface-500">Most Spending:</span><p className="font-medium text-surface-900 dark:text-white">{data.mostSpendingCategory}</p></div>
              <div><span className="text-surface-500">Avg Daily Expense:</span><p className="font-medium text-surface-900 dark:text-white">{formatCurrency(data.averageDailyExpense)}</p></div>
              <div><span className="text-surface-500">Transactions:</span><p className="font-medium text-surface-900 dark:text-white">{data.transactionCount}</p></div>
              <div><span className="text-surface-500">Period:</span><p className="font-medium text-surface-900 dark:text-white">{data.period}</p></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
