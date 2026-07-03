import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary', loading }) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    emerald: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    violet: 'from-violet-500 to-violet-600',
  };

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.primary}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-white mb-1">{value}</p>
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}% from last month
        </p>
      )}
    </motion.div>
  );
}
