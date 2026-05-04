import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../utils/validators';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckSquare, Sun, Moon } from 'lucide-react';

export default function Signup() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.signup(data);
      login(res.data);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
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

        <p className="auth-heading">Create your account</p>
        <p className="auth-sub">Join your team and start managing tasks</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <input id="signup-name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" {...register('name')} />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="john@company.com" {...register('email')} />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min 6 characters" {...register('password')} />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button id="btn-signup-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={isSubmitting}>
            {isSubmitting ? <div className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
