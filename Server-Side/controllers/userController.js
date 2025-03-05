const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const User = require("../models/userModel");

const axios = require("axios");

exports.getMe = catchAsync(async (req, res, next) => {
  // 1. Check if user exists

  const user = await User.findOne({ fbId: req.user.fbId });
  // 2. If not, return an error
  if (!user) return next(new AppError("User not found", 404));
  // 3. Return the user document
  res.status(200).json({
    status: "success",
    data: user,
  });
});

const extractMetricValue = (data, metricName) => {
  const metric = data.find((item) => item.name === metricName);

  return (metric && metric.values?.[metric.values.length - 1].value) || 0;
};

exports.getPageInsights = catchAsync(async (req, res, next) => {
  const { pageId, access_token, since, until } = req.body;

  if (!pageId || !access_token) {
    return next(new AppError("Page ID and Access Token are required!", 400));
  }

  if (
    (since && isNaN(new Date(since).getTime())) ||
    (until && isNaN(new Date(until).getTime()))
  ) {
    return next(new AppError("Invalid 'since' or 'until' date format.", 400));
  }

  // Construct the URL parameters dynamically
  let url = `https://graph.facebook.com/v22.0/${pageId}/insights?metric=page_follows,page_post_engagements,post_impressions_unique,post_reactions_like_total&access_token=${access_token}`;

  if (since) {
    url += `&since=${new Date(since).getTime() / 1000}`;
  }

  if (until) {
    url += `&until=${new Date(until).getTime() / 1000}`;
  }

  if (!since || !until) {
    url += "&period=days_28";
  }

  const response = await axios.get(url);

  if (!response.data || !response.data.data) {
    return next(new AppError("No insights data found!", 404));
  }

  const insightsData = response?.data.data;

  // Extract insights
  const totalFollowers = extractMetricValue(insightsData, "page_follows");
  const totalEngagement = extractMetricValue(
    insightsData,
    "page_post_engagements"
  );
  const totalImpressions = extractMetricValue(
    insightsData,
    "post_impressions_unique"
  );
  const totalReactions = extractMetricValue(
    insightsData,
    "page_actions_post_reactions"
  );

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      totalFollowers,
      totalEngagement,
      totalImpressions,
      totalReactions,
    },
  });
});
