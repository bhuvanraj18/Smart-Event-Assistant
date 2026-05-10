import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import '../../components/auth/auth.css';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../utils/authApi';

const validate = (form) => {
  const errors = {};

  if (!form.password) errors.password = 'Password is required.';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
};

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const errors = useMemo(() => validate(form), [form]);
  const canSubmit = Object.keys(errors).length === 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (!canSubmit) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, { password: form.password, confirmPassword: form.confirmPassword });
      toast.success('Password updated successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password for your Event Genie account."
      subtitle="Choose a strong password and continue back into your planning dashboard."
      highlights={[
        {
          icon: <LockKeyhole size={18} />,
          title: 'Time-limited link',
          description: 'Password reset tokens expire quickly and cannot be reused after a successful update.',
        },
      ]}
    >
      <div className="auth-form-header">
        <p className="auth-form-eyebrow">Reset password</p>
        <h2 className="auth-form-title">Create a new password</h2>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label className="auth-field-label">New Password</label>
          <div className="auth-field-wrapper">
            <LockKeyhole className="auth-field-icon" size={18} />
            <input
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              className="auth-input auth-input-right-pad"
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)} className="auth-toggle-password">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.password && errors.password && <p className="auth-error">{errors.password}</p>}
        </div>

        <div>
          <label className="auth-field-label">Confirm Password</label>
          <div className="auth-field-wrapper">
            <LockKeyhole className="auth-field-icon" size={18} />
            <input
              value={form.confirmPassword}
              onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm new password"
              className="auth-input auth-input-right-pad"
            />
            <button type="button" onClick={() => setShowConfirm((current) => !current)} className="auth-toggle-password">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <p className="auth-footer-text">
        Need a new reset link?{' '}
        <Link to="/forgot-password" className="auth-link" style={{ fontWeight: 600 }}>
          Request another
        </Link>
      </p>
    </AuthShell>
  );
};

export default ResetPasswordPage;
