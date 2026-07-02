const { body, query } = require('express-validator');

const CATEGORIES = ['Product', 'Support', 'Billing', 'Feature Request', 'UI/UX', 'Other'];

exports.CATEGORIES = CATEGORIES;

/**
 * Validation rules for feedback submission requests
 */
exports.submitFeedbackValidation = [
  body('category')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('comment')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Comment must be 3-2000 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email must be valid'),
  body('rating')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5'),
];

/**
 * Validation rules for feedback retrieval query parameters
 */
exports.getFeedbackValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
];
