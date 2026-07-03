import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Check your email</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-6">
          We've sent a password reset link to your email address.
        </p>
        <Link to="/login" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Forgot password?</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Enter your email and we'll send you a reset link.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="input-field pl-10"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Send Reset Link
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
