const feedbackModel = require('../models/feedback.model');

async function getSummary(req, res, next) {
  try {
    const summary = await feedbackModel.getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary };
