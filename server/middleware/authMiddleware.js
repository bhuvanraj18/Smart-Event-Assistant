import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'You are not logged in. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return res.status(401).json({
        message: 'The token is no longer valid. Please log in again.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed. Please log in again.',
      error: error.message,
    });
  }
};

export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: 'You do not have permission to access this resource.',
    });
  }

  next();
};
