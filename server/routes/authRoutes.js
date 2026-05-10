import express from 'express';
import { body, validationResult } from 'express-validator';
import { forgotPassword, login, logout, me, register, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  return next();
};

router.post(
  '/register',
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
  body('termsAccepted').custom((value) => value === true || value === 'true').withMessage('You must accept the terms and conditions.'),
  handleValidation,
  register
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  body('rememberMe').optional().isBoolean().withMessage('Remember Me must be a boolean.'),
  handleValidation,
  login
);

router.get('/me', protect, me);
router.post('/logout', logout);

router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  handleValidation,
  forgotPassword
);

router.post(
  '/reset-password/:token',
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
  handleValidation,
  resetPassword
);

export default router;
