import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, CreditCard, Target, Trash2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/auth';
import StatCard from '../components/common/StatCard';
import { StatCardSkeleton, ChartSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStatistics(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <p className="text-surface-500 dark:text-surface-400">System overview and management</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="primary" />
          <StatCard title="Transactions" value={stats?.totalTransactions || 0} icon={CreditCard} color="emerald" />
          <StatCard title="Active Budgets" value={stats?.totalBudgets || 0} icon={Target} color="violet" />
          <StatCard title="New This Month" value={stats?.newUsersThisMonth || 0} icon={BarChart3} color="amber" />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Users</h3>
        {users.length === 0 ? (
          <EmptyState title="No users" description="No users registered yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left text-xs font-medium text-surface-500 uppercase pb-3 px-4">Name</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase pb-3 px-4">Email</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase pb-3 px-4">Role</th>
                  <th className="text-left text-xs font-medium text-surface-500 uppercase pb-3 px-4">Verified</th>
                  <th className="text-right text-xs font-medium text-surface-500 uppercase pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50">
                    <td className="py-3 px-4 text-sm font-medium text-surface-900 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4 text-sm text-surface-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'badge-warning' : 'badge-info'}`}>{u.role.replace('ROLE_', '')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${u.emailVerified ? 'badge-success' : 'badge-danger'}`}>{u.emailVerified ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
