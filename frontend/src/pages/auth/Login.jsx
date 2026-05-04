import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validators';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckSquare, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      login(res.data);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 24, right: 32 }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><CheckSquare size={20} /></div>
          <span className="auth-logo-text">TaskFlow</span>
        </div>

        <p className="auth-heading">Welcome back</p>
        <p className="auth-sub">Sign in to your workspace</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="john@company.com" {...register('email')} />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Your password" {...register('password')} />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button id="btn-login-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
