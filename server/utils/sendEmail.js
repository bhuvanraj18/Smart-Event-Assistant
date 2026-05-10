import nodemailer from 'nodemailer';

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const buildTransporter = () => {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = buildTransporter();

  if (!transporter) {
    console.log('ℹ️ SMTP is not configured. Password reset URL:', resetUrl);
    return { delivered: false, resetUrl };
  }

  const from = process.env.EMAIL_FROM || `Event Genie <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your Event Genie password',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2 style="margin: 0 0 16px;">Reset your Event Genie password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password. Click the button below to continue:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#0f1118;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true };
};
