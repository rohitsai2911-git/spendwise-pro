import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, AlertTriangle, CheckCircle, DollarSign, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationApi } from '../api/auth';
import EmptyState from '../components/common/EmptyState';

const typeIcons = {
  BUDGET_EXCEEDED: AlertTriangle,
  GOAL_ACHIEVED: CheckCircle,
  UPCOMING_BILL: DollarSign,
  MONTHLY_SUMMARY: BellRing,
};

const typeColors = {
  BUDGET_EXCEEDED: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  GOAL_ACHIEVED: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  UPCOMING_BILL: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  MONTHLY_SUMMARY: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {}
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Notifications</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Stay informed about your finances</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="btn-secondary">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="card"><div className="skeleton h-16 w-full" /></div>)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {notifications.map((n, idx) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`card-hover flex items-start gap-4 cursor-pointer ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
              >
                <div className={`p-2.5 rounded-xl ${typeColors[n.type] || 'bg-surface-100 dark:bg-surface-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${!n.isRead ? 'text-surface-900 dark:text-white' : 'text-surface-500'}`}>{n.title}</h4>
                  <p className="text-sm text-surface-500 mt-0.5">{n.message}</p>
                </div>
                <div className="text-xs text-surface-400 whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
