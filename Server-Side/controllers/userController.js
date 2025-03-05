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

  const sinceTimestamp = since
    ? Math.floor(new Date(since).getTime() / 1000)
    : undefined;
  const untilTimestamp = until
    ? Math.floor(new Date(until).getTime() / 1000)
    : undefined;

  // Get Page Insights
  let pageUrl = `https://graph.facebook.com/v22.0/${pageId}/insights?metric=page_follows,page_post_engagements&access_token=${access_token}`;

  if (!since || !until) {
    pageUrl += "&period=days_28";
  }

  if (sinceTimestamp) pageUrl += `&since=${sinceTimestamp}`;
  if (untilTimestamp) pageUrl += `&until=${untilTimestamp}`;

  const pageResponse = await axios.get(pageUrl);
  if (!pageResponse.data || !pageResponse.data.data) {
    return next(new AppError("No page insights data found!", 404));
  }
  const pageInsights = pageResponse.data.data;

  const totalFollowers = extractMetricValue(pageInsights, "page_follows");
  const totalEngagement = extractMetricValue(
    pageInsights,
    "page_post_engagements"
  );

  // Get Posts Insights
  let postsUrl = `https://graph.facebook.com/v22.0/${pageId}/posts?fields=id,created_time&access_token=${access_token}`;

  const postsResponse = await axios.get(postsUrl);
  const posts = postsResponse.data.data;

  // Fetch insights for each post and sum up reactions & impressions
  let totalPostReactions = 0;
  let totalPostImpressions = 0;

  const insightsPromises = posts.map(async (post) => {
    let insightsUrl = `https://graph.facebook.com/v22.0/${post.id}/insights?metric=post_reactions_like_total,post_impressions&access_token=${access_token}`;

    if (sinceTimestamp) insightsUrl += `&since=${sinceTimestamp}`;
    if (untilTimestamp) insightsUrl += `&until=${untilTimestamp}`;

    const insightsResponse = await axios.get(insightsUrl);

    const insightsData = insightsResponse.data.data.reduce((acc, metric) => {
      acc[metric.name] = metric.values.length ? metric.values[0].value : 0;
      return acc;
    }, {});

    // Total reactions & impressions
    totalPostReactions += insightsData.post_reactions_like_total || 0;
    totalPostImpressions += insightsData.post_impressions || 0;

    return {
      postId: post.id,
      createdTime: post.created_time,
      ...insightsData,
    };
  });

  const postInsights = await Promise.all(insightsPromises);

  res.status(200).json({
    status: "success",
    data: {
      totalFollowers,
      totalEngagement,
      totalPostImpressions,
      totalPostReactions,
      postInsights,
    },
  });
});
