import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="p-4 bg-surface-100 dark:bg-surface-700 rounded-2xl mb-4">
        <Icon className="w-12 h-12 text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-sm mb-6">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
