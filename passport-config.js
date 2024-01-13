const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, findUserByEmail, findUserById) {
  const authenticateUser = async (email, password, done) => {
    (async () => {
      let user = await findUserByEmail(email);
      if (!user.length) {
        return done(null, false, { message: "Wrong e-mail" });
      }
      try {
        if (await bcrypt.compare(password, user[0].password)) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Wrong Password" });
        }
      } catch (error) {
        return done(error);
      }
    })();
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    return done(null, user[0].id);
  });
  passport.deserializeUser(async (id, done) => {
    return done(null, await findUserById(id));
  });
}
module.exports = initialize;
