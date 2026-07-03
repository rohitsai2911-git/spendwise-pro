import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Moon, Sun, Save, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/auth';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      monthlyIncome: user?.monthlyIncome || 0,
    },
  });

  const { register: pwRegister, handleSubmit: pwHandleSubmit, reset: pwReset } = useForm();

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile(data);
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword(data);
      toast.success('Password changed');
      pwReset();
      setChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your account settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-surface-500">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label"><User className="w-4 h-4 inline mr-1" /> Name</label>
            <input type="text" {...register('name', { required: 'Name is required' })} className="input-field" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label"><Mail className="w-4 h-4 inline mr-1" /> Email</label>
            <input type="email" value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="label"><Phone className="w-4 h-4 inline mr-1" /> Phone</label>
            <input type="tel" {...register('phone')} className="input-field" placeholder="+1 234 567 890" />
          </div>
          <div>
            <label className="label">Monthly Income</label>
            <input type="number" step="0.01" {...register('monthlyIncome')} className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Preferences</h3>
        <div className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700 rounded-xl">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-surface-600 dark:text-surface-300" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-surface-500">{darkMode ? 'Dark' : 'Light'} theme</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-surface-300'}`}
          >
            <div className={`absolute w-5 h-5 bg-white rounded-full shadow top-0.5 transition-transform ${darkMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
          <Lock className="w-4 h-4 inline mr-1" /> Change Password
        </h3>
        {changingPassword ? (
          <form onSubmit={pwHandleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" {...pwRegister('currentPassword', { required: 'Required' })} className="input-field" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" {...pwRegister('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setChangingPassword(false); pwReset(); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Change Password</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setChangingPassword(true)} className="btn-secondary">Change Password</button>
        )}
      </motion.div>
    </div>
  );
}
