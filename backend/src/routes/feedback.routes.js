const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { submitFeedbackValidation, getFeedbackValidation } = require('../validations/feedback.validation');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { feedbackSubmitLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public: anyone can submit feedback
router.post('/', feedbackSubmitLimiter, submitFeedbackValidation, validate, feedbackController.submitFeedback);

// Admin-only: view/search/filter feedback for the dashboard
router.get('/', requireAuth, getFeedbackValidation, validate, feedbackController.getFeedback);

module.exports = router;
