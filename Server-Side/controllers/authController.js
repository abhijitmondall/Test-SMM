const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.protected = catchAsync(async (req, res, next) => {
  // 1. Getting token and check if it's exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access!", 401)
    );
  }

  console.log(token);

  // 2. Verify the token
  const { userId } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findOne({ fbId: userId });
  if (!currentUser) {
    return next(
      new AppError("The User belonging to this token no longer exists!", 401)
    );
  }

  // 4 Grand Access to protected route
  req.user = currentUser;
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const redirectUri = process.env.REDIRECT_URI;
  const clientId = process.env.APP_ID;
  const scope =
    "read_insights,pages_show_list, public_profile, email, pages_read_engagement, pages_read_user_content,,pages_manage_engagement,instagram_content_publish";
  const url = `https://www.facebook.com/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  res.redirect(url);
});

exports.callback = catchAsync(async (req, res, next) => {
  const { code, error } = req.query;

  if (error) return next(new AppError(`Instagram Error: ${error}`, 400));
  if (!code) return next(new AppError("No Code Provided!", 400));

  const tokenResponse = await axios.post(
    "https://graph.facebook.com/v22.0/oauth/access_token",
    {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URI,
      code,
    }
  );

  const { access_token } = tokenResponse.data;

  // Corrected profile URL
  const userResponse = await axios.get(
    `https://graph.facebook.com/v22.0/me?fields=id,name,picture&access_token=${access_token}`
  );

  // console.log(userResponse.data);

  // Make a GET request to fetch pages the user manages
  const response = await axios.get(
    "https://graph.facebook.com/v22.0/me/accounts",
    {
      params: {
        access_token,
      },
    }
  );

  // console.log(response.data.data);

  // Handle the response and log the page information
  let user = await User.findOne({ fbId: userResponse.data.id });

  if (!user) {
    user = new User({
      fbId: userResponse.data.id,
      fullName: userResponse.data.name,
      photo: userResponse.data.picture.data.url,
      pages: response.data.data,
      accessToken: access_token,
    });
    await user.save();
  } else {
    user.accessToken = access_token;
    await user.save();
  }

  // Generate JWT Token
  const token = signToken(userResponse.data.id);

  res.redirect(`http://localhost:5173/?token=${token}`);
});
