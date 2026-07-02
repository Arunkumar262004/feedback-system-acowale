const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    logger.info(`Admin login successful: ${email}`);
    res.json({ success: true, data: { token, user: { email: user.email, role: user.role } } });
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ success: true, data: req.user });
}

module.exports = { login, me };
