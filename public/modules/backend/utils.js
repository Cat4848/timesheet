const jwt = require("jsonwebtoken");

function cookiesParser(req) {
  const cookieText = req.headers.cookie;
  const cookieSplit = cookieText.split(";");
  const cookies = cookieSplit.reduce((acc, curr) => {
    const data = curr.trim().split("=");
    acc[`${data[0]}`] = data[1];
    return acc;
  }, {});
  return cookies;
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

async function isAuthorized(req, res, next) {
  const cookies = cookiesParser(req);
  const token = cookies && cookies.accessToken;
  if (token === undefined) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) {
      if (err.message === "jwt expired") {
        //if access token expired, use the refresh token stored in the session
        //to generate a new access token and set the new access token
        //to cookies
        jwt.verify(
          req.session.refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (error, user) => {
            if (error) {
              req.logout((error) => {
                if (error) return next(error);
                res.redirect("/login");
              });
            } else {
              const userInfo = {
                email: user.email,
                permission: user.permission
              };
              const accessToken = generateAccessToken(userInfo);
              if (process.env.NODE_ENV === "production") {
                res.cookie("accessToken", accessToken, {
                  httpOnly: true,
                  secure: true
                });
              } else {
                res.cookie("accessToken", accessToken, {
                  httpOnly: true
                });
              }
              next();
            }
          }
        );
      }
    } else {
      next();
    }
  });
}

function isOfficeAdmin(req, res, next) {
  if (req.user.permission === "office") {
    next();
  } else {
    res.sendStatus(403);
  }
}

function isDriver(req, res, next) {
  if (req.user.permission === "driver") {
    next();
  } else {
    res.sendStatus(403);
  }
}

function toFloat(hours, minutes) {
  const floatMinutes = parseFloat((minutes / 60).toFixed(2));
  const totalTimeFloat = hours + floatMinutes;
  return totalTimeFloat;
}

function toHoursAndMinutes(timeFloat) {
  const totalMinutes = timeFloat * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
}

module.exports = {
  generateAccessToken,
  cookiesParser,
  isAuthenticated,
  isAuthorized,
  isOfficeAdmin,
  isDriver,
  toFloat,
  toHoursAndMinutes
};
