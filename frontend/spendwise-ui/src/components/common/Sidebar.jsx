import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Wallet, ArrowDownCircle, ArrowUpCircle,
  PiggyBank, Target, BarChart3, Bell, Settings,
  Shield, X, Wallet as WalletIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowDownCircle, label: 'Transactions' },
  { to: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-xl">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900 dark:text-white">SpendWise</h1>
            <p className="text-xs text-surface-500">Finance Platform</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
          <X className="w-5 h-5 text-surface-500" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`sidebar-link group relative ${isActive ? 'active' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        })}

        {user?.role?.includes('ADMIN') && (
          <>
            <div className="my-3 border-t border-surface-200 dark:border-surface-700" />
            <NavLink
              to="/admin"
              onClick={onClose}
              className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <Shield className="w-5 h-5" />
              <span>Admin</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-surface-200 dark:border-surface-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 z-50">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
