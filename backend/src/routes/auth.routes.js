const express = require('express');
const authController = require('../controllers/auth.controller');
const { loginValidation } = require('../validations/auth.validation');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, loginValidation, validate, authController.login);

router.get('/me', requireAuth, authController.me);

module.exports = router;
