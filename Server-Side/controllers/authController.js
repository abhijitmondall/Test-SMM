const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const catchAsync = require("../utils/catchAsync");

const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// exports.jwt = catchAsync(async (req, res, next) => {
//   const { email } = req.params;

//   // 2. Check if user exists
//   const user = await User.findOne({ email });

//   if (!email || !user) {
//     return next(
//       new AppError(
//         "You don not have permission to perform this action!(Invalid Email/User)",
//         403
//       )
//     );
//   }

//   // 3. If everything is ok, send token to the client
//   const token = signToken(user.email);
//   res.status(200).json({
//     status: "success",
//     token,
//   });
// });

// exports.protected = catchAsync(async (req, res, next) => {
//   // 1. Getting token and check if it's exists
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return next(
//       new AppError("You are not logged in! Please log in to get access!", 401)
//     );
//   }

//   // 2. Verify the token
//   const { email } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//   console.log(email);
//   // 3. Check if user still exists
//   const currentUser = await User.findOne({ email });
//   if (!currentUser) {
//     return next(
//       new AppError("The User belonging to this token no longer exists!", 401)
//     );
//   }

//   // 4 Grand Access to protected route
//   req.user = currentUser;
//   next();
// });

exports.login = catchAsync(async (req, res, next) => {
  const redirectUri = process.env.REDIRECT_URI;
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.IG_APP_ID}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_content_publish&response_type=code`;
  res.redirect(url);
});

exports.callback = catchAsync(async (req, res, next) => {
  const { code } = req.query;

  if (!code) return next(new AppError("No Code Provided!", 400));

  // Exchange Code for Access Token
  const tokenResponse = await axios.post(
    "https://graph.facebook.com/v18.0/oauth/access_token",
    null,
    {
      params: {
        client_id: process.env.IG_APP_ID,
        client_secret: process.env.IG_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
        code,
      },
    }
  );

  const { access_token, user_id } = tokenResponse.data;

  // Fetch Instagram User Profile (Business Account)
  const userResponse = await axios.get(
    `https://graph.facebook.com/${user_id}?fields=id,name,email&access_token=${access_token}`
  );

  let user = await User.findOne({ instagramId: userResponse.data.id });

  if (!user) {
    user = new User({
      instagramId: userResponse.data.id,
      username: userResponse.data.name,
      accessToken: access_token,
    });
    await user.save();
  } else {
    user.accessToken = access_token;
    await user.save();
  }

  // Generate JWT Token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.redirect(`http://localhost:5173/dashboard?token=${token}`);
});

// exports.restrictTo = (...roles) => {
//   return (req, res, next) => {
//     // Here Roles will be an Array
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new AppError("You don not have permission to perform this action!", 403)
//       );
//     }

//     next();
//   };
// };
