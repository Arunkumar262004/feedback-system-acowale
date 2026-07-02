const feedbackModel = require('../models/feedback.model');
const logger = require('../config/logger');
const { feedbackSubmittedTotal } = require('../utils/metrics');

async function submitFeedback(req, res, next) {
  try {
    const { category, comment, email, rating } = req.body;
    const feedback = await feedbackModel.create({ category, comment, email, rating });
    feedbackSubmittedTotal.inc({ category });
    logger.info(`New feedback submitted [${category}]`);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
}

async function getFeedback(req, res, next) {
  try {
    const { category, search, status, page, limit } = req.query;
    const result = await feedbackModel.findAll({ category, search, status, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitFeedback, getFeedback };
