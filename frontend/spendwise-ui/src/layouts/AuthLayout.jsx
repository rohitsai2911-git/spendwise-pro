import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Wallet className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold">SpendWise Pro</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Take Control of Your Finances
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            Track expenses, manage budgets, set savings goals, and gain
            financial insights with our intelligent platform.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-primary-200 text-sm">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-primary-200 text-sm">Transactions</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-primary-200 text-sm">
          &copy; 2024 SpendWise Pro. All rights reserved.
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary-600 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white">
              SpendWise Pro
            </span>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
