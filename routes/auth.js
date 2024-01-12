const express = require("express");
const router = express();
const passport = require("passport");
const Driver = require("../models/driver");
const OfficeAdmin = require("../models/officeAdmin");
const RefreshToken = require("../models/refreshToken");
const { generateAccessToken } = require("../public/modules/backend/utils");
const { isAuthenticated } = require("../public/modules/backend/utils");
const jwt = require("jsonwebtoken");
router.set("layout", "layouts/authentication");

const initializePassport = require("../passport-config");
initializePassport(passport, findUserByEmail, findUserById);

async function findUserByEmail(email) {
  const driver = await Driver.find({ email: email });
  const officeAdmin = await OfficeAdmin.find({ email: email });
  return driver.length ? driver : officeAdmin;
}

async function findUserById(id) {
  const driver = await Driver.findById(id);
  const officeAdmin = await OfficeAdmin.findById(id);
  return driver !== null ? driver : officeAdmin;
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.permission === "driver") {
    return res.redirect("/drivers");
  } else if (req.isAuthenticated() && req.user.permission === "office") {
    return res.redirect("/office");
  }
  return next();
}

async function checkRefreshTokenExists(user) {
  console.log("beginning checkRefreshTokenExists function");
  let refreshTokens = [];
  let unusedRefreshToken = {};
  let refreshToken = "";
  try {
    refreshTokens = await RefreshToken.find({ email: user.email });
  } catch {
    console.log("Authentication file: Error finding Refresh Token in MongoDB");
    return new Error("Mongo DB Error");
  }
  if (!refreshTokens.length) {
    console.log("checkRefreshTokenExists function -> NOT if statement");
    return false;
  } else {
    console.log("checkRefreshTokenExists function -> else statement");
    unusedRefreshToken = refreshTokens.filter((token) => token.used === false);
    if (!unusedRefreshToken.length) {
      console.log("checkRefreshTokenExists function -> else NOT statement");
      //this happens when all the tokens have been used(expired)
      //in other words we can't find any token
      //that has its used property set to false
      return new Error("Please contact your System Administrator");
    } else if (unusedRefreshToken.length > 1) {
      //if more that one token that is unused, the system Administrator
      //issued new refresh tokens without updating last one's property
      //to "used": "true" in MongoDB
      return new Error("Please contact your System Administrator");
    } else {
      console.log("checkRefreshTokenExists function -> last else statement");
      refreshToken = unusedRefreshToken[0].token;
      console.log(
        "checkRefreshTokenExists function -> last else statement -> refreshToken",
        refreshToken
      );
      return refreshToken;
    }
  }
}

async function addNewRefreshTokenToDB(user, refreshToken) {
  const refreshTokenDocument = new RefreshToken({
    email: user.email,
    token: refreshToken,
    used: false
  });
  let newRefreshToken;
  try {
    newRefreshToken = await refreshTokenDocument.save();
  } catch (error) {
    //return error if any problem with adding to MongoDB,
    //including adding duplicated records
    console.log(
      "Authentication file: Error adding a new Refresh Token to Mongo DB",
      error
    );
    return new Error("Error adding a new Refresh Token to Mongo DB");
  }
  if (Object.keys(newRefreshToken).length) {
    //if the document was successfully stored in the MongoDB, return true
    return true;
  } else {
    //for any other cases, return an error
    return new Error("Error");
  }
}

router.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index");
});

router.get("/login", checkNotAuthenticated, (req, res) => {
  console.log("login get route");
  res.render("authentication", {
    driverEmail: process.env.DRIVER_EMAIL,
    driverPassword: process.env.DRIVER_PASSWORD
  });
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  async (req, res) => {
    //access token logic
    console.log("index route -> login post -> req.user", req.user);
    const user = {
      email: req.user[0].email,
      permission: req.user[0].permission
    };
    const accessToken = generateAccessToken(user);
    if (router.get("env" === "production")) {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true
      });
    } else {
      res.cookie("accessToken", accessToken, {
        httpOnly: true
      });
    }
    //refresh token logic
    console.log("login route before the refresh token check");
    (async () => {
      const refreshTokenCheck = await checkRefreshTokenExists(user);
      console.log("login route refresh token check value", refreshTokenCheck);
      if (refreshTokenCheck instanceof Error) {
        console.log("login route instance of Error check 1");
        res.sendStatus(403);
      } else if (refreshTokenCheck) {
        console.log("login route instance else if");
        //found current refresh token. If token not expired, add it to the session
        jwt.verify(
          refreshTokenCheck,
          process.env.REFRESH_TOKEN_SECRET,
          (error, user) => {
            if (error) {
              console.log("login route jwt.verify error");
              req.logOut((error) => {
                if (error) return next(error);
                res.redirect("/login");
              });
            }
            console.log("login route after jwt.verify error");
            //add refresh token to the session
            req.session.refreshToken = refreshTokenCheck;
          }
        );
      } else {
        console.log("login route no tokens else statement");
        //found no tokens -> create one and add it to the session and in Mongo DB
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: "365 days"
        });
        const refreshTokenStatus = addNewRefreshTokenToDB(user, refreshToken);
        if (refreshTokenStatus instanceof Error) {
          //MongoDB Error
          res.redirect("/login");
        } else {
          //token saved into MongoDB successfully -> add Refresh Token in session
          req.session.refreshToken = refreshToken;
        }
      }
      if (user.permission === "driver") {
        res.redirect("/drivers");
      } else if (user.permission === "office") {
        res.redirect("/office");
      }
      // res.send("login successful");
    })();
    req.session.loggedInAs = req.user[0].name;
  }
);

router.delete("/logout", isAuthenticated, (req, res, next) => {
  console.log("logout route");
  req.logOut((error) => {
    if (error) return next(error);
    res.redirect("/login");
  });
});

module.exports = router;
