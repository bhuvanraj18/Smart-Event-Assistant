import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import '../../components/auth/auth.css';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../utils/authApi';

const initialForm = {
  email: '',
  password: '',
  rememberMe: true,
};

const validate = (form) => {
  const errors = {};

  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';

  if (!form.password) errors.password = 'Password is required.';

  return errors;
};

const LoginPage = () => {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const errors = useMemo(() => validate(form), [form]);
  const canSubmit = Object.keys(errors).length === 0 && form.email && form.password;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!canSubmit) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setSubmitting(true);
      await login({
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe,
      });
      toast.success('Welcome back to Event Genie.');
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(normalizeApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to continue planning extraordinary events."
      subtitle="Access your dashboard, saved ideas, vendor recommendations, and all your event planning tools in one secure place."
      highlights={[
        {
          icon: <Mail size={18} />,
          title: 'Personalized planning',
          description: 'Pick up where you left off and continue your event journey instantly.',
        },
        {
          icon: <LockKeyhole size={18} />,
          title: 'Secure JWT session',
          description: 'Your login is protected with secure HTTP-only cookies and route guards.',
        },
      ]}
    >
      <div className="auth-form-header">
        <p className="auth-form-eyebrow">Login</p>
        <h2 className="auth-form-title">Welcome back</h2>
        <p className="auth-form-subtitle">
          Login with your Event Genie account to manage event ideas, budgets, and AR previews.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="auth-field-label">Email</label>
          <div className="auth-field-wrapper">
            <Mail className="auth-field-icon" size={18} />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              type="email"
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
          {touched.email && errors.email && <p className="auth-error">{errors.email}</p>}
        </div>

        <div>
          <label className="auth-field-label">Password</label>
          <div className="auth-field-wrapper">
            <LockKeyhole className="auth-field-icon" size={18} />
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="auth-input auth-input-right-pad"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="auth-toggle-password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.password && errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div className="auth-checkbox-row">
          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              className="auth-checkbox"
            />
            Remember Me
          </label>
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="auth-button"
        >
          {submitting ? <LoaderCircle className="animate-spin" size={18} /> : null}
          {submitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer-text">
        New to Event Genie?{' '}
        <Link to="/signup" className="auth-link" style={{ fontWeight: 600 }}>
          Create your account
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
