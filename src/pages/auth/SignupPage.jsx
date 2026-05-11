import { CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import '../../components/auth/auth.css';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../utils/authApi';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

const passwordRules = [
  { label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { label: 'One number', test: (value) => /[0-9]/.test(value) },
];

const validate = (form) => {
  const errors = {};

  if (!form.name.trim()) errors.name = 'Full name is required.';
  else if (form.name.trim().length < 2) errors.name = 'Full name must be at least 2 characters.';

  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';

  if (!form.password) errors.password = 'Password is required.';
  else {
    const failedRule = passwordRules.find((rule) => !rule.test(form.password));
    if (failedRule) errors.password = failedRule.label;
  }

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';

  if (!form.termsAccepted) errors.termsAccepted = 'You must accept the terms to continue.';

  return errors;
};

const SignupPage = () => {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => validate(form), [form]);
  const isPasswordValid = passwordRules.every((rule) => rule.test(form.password));
  const canSubmit = Object.keys(errors).length === 0 && form.name && form.email && form.password && form.confirmPassword && form.termsAccepted;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    });

    if (!canSubmit) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        termsAccepted: form.termsAccepted,
      });
      toast.success('Your Event Genie account is ready.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(normalizeApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join Event Genie and start building beautiful events."
      subtitle="Create your secure account to access the full event planning dashboard, vendor tools, and AR previews."
      highlights={[
        {
          icon: <CheckCircle2 size={18} />,
          title: 'Fast setup',
          description: 'Get an account in seconds and keep all your event planning in one place.',
        },
        {
          icon: <LockKeyhole size={18} />,
          title: 'Future-ready auth',
          description: 'Built on JWT, secure cookies, and a clean backend structure for scaling later.',
        },
      ]}
    >
      <div className="auth-form-header">
        <p className="auth-form-eyebrow">Register</p>
        <h2 className="auth-form-title">Create your account</h2>
        <p className="auth-form-subtitle">
          Sign up once and keep your event plans, recommendations, and saved designs synced across devices.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="auth-field-label">Full Name</label>
          <div className="auth-field-wrapper">
            <UserRound className="auth-field-icon" size={18} />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => setTouched((current) => ({ ...current, name: true }))}
              type="text"
              placeholder="Your full name"
              className="auth-input"
            />
          </div>
          {touched.name && errors.name && <p className="auth-error">{errors.name}</p>}
        </div>

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
              placeholder="Create a password"
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
          <div className="auth-password-rules">
            {passwordRules.map((rule) => {
              const met = rule.test(form.password);
              return (
                <div key={rule.label} className="auth-password-rule">
                  <span className={`auth-rule-dot ${met ? 'auth-rule-dot-met' : 'auth-rule-dot-unmet'}`} />
                  {rule.label}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="auth-field-label">Confirm Password</label>
          <div className="auth-field-wrapper">
            <LockKeyhole className="auth-field-icon" size={18} />
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              className="auth-input auth-input-right-pad"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((current) => !current)}
              className="auth-toggle-password"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
        </div>

        <label className="auth-terms-label">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={form.termsAccepted}
            onChange={handleChange}
            onBlur={() => setTouched((current) => ({ ...current, termsAccepted: true }))}
            className="auth-checkbox"
          />
          <span>
            I agree to the Event Genie <span className="auth-terms-bold">Terms & Conditions</span> and understand that my event data may be saved for account access.
          </span>
        </label>
        {touched.termsAccepted && errors.termsAccepted && <p className="auth-error">{errors.termsAccepted}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="auth-button"
        >
          {submitting ? <LoaderCircle className="animate-spin" size={18} /> : null}
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="auth-link" style={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default SignupPage;
