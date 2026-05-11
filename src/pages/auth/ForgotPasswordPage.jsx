import { LoaderCircle, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import '../../components/auth/auth.css';
import { useAuth } from '../../context/AuthContext';
import { normalizeApiError } from '../../utils/authApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const { forgotPassword } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await forgotPassword({ email });
      toast.success(response.message || 'Reset instructions sent.');
      setResetUrl(response.resetUrl || '');
    } catch (error) {
      toast.error(normalizeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Recover your Event Genie account."
      subtitle="Enter the email attached to your account and we will send a password reset link if it exists."
      highlights={[
        {
          icon: <Mail size={18} />,
          title: 'Secure recovery',
          description: 'Reset links are short-lived and protected by hashed reset tokens on the server.',
        },
        {
          icon: <Send size={18} />,
          title: 'Fast turnaround',
          description: 'In development, the reset URL is returned directly so you can test the full flow quickly.',
        },
      ]}
    >
      <div className="auth-form-header">
        <p className="auth-form-eyebrow">Forgot password</p>
        <h2 className="auth-form-title">Reset your password</h2>
      </div>

      <form onSubmit={submit} className="auth-form">
        <div>
          <label className="auth-field-label">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="auth-input auth-input-no-icon"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? <LoaderCircle className="animate-spin" size={18} /> : null}
          {loading ? 'Sending Link...' : 'Send Reset Link'}
        </button>
      </form>

      {resetUrl ? (
        <div style={{
          marginTop: '1.5rem',
          border: '1px solid rgba(139,105,20,0.18)',
          background: 'rgba(139,105,20,0.06)',
          padding: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          Development reset link:<br />
          <a style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            wordBreak: 'break-all',
            fontWeight: 500,
            color: 'var(--accent-gold)'
          }} href={resetUrl}>
            {resetUrl}
          </a>
        </div>
      ) : null}

      <p className="auth-footer-text">
        Remembered your password?{' '}
        <Link to="/login" className="auth-link" style={{ fontWeight: 600 }}>
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
