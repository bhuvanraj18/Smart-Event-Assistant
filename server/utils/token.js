import jwt from 'jsonwebtoken';

export const signToken = (id, expiresIn = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });

export const getCookieOptions = (rememberMe = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
});

export const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  emailVerified: user.emailVerified,
});
