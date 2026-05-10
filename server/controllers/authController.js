import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';
import { getCookieOptions, sanitizeUser, signToken } from '../utils/token.js';

const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  const token = signToken(user._id, rememberMe ? '30d' : undefined);
  const cookieOptions = getCookieOptions(rememberMe);

  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'success',
    token,
    user: sanitizeUser(user),
  });
};

const buildResetUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/reset-password/${token}`;
};

const buildResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  return { resetToken, hashedToken };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    return res.status(500).json({
      message: 'Registration failed.',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    user.password = undefined;
    return sendTokenResponse(user, 200, res, Boolean(rememberMe));
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed.',
      error: error.message,
    });
  }
};

export const me = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: sanitizeUser(req.user),
  });
};

export const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });

  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const { resetToken, hashedToken } = buildResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = buildResetUrl(resetToken);
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return res.status(200).json({
      status: 'success',
      message: 'If that email exists, a reset link has been sent.',
      resetUrl: emailResult.delivered ? undefined : emailResult.resetUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Password reset request failed.',
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: 'Reset token is invalid or has expired.',
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(500).json({
      message: 'Password reset failed.',
      error: error.message,
    });
  }
};
