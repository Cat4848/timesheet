const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, findUserByEmail, findUserById) {
    const authenticateUser = async (email, password, done) => {
        console.log("initialize function -> email", email);
        console.log("initialize function -> password", password);
        (async () => {
            let user = await findUserByEmail(email);
            console.log("init function async -> user", user);
            if (!user.length) {
                console.log("initialize function first if statement");
                return done(null, false, { message: "Wrong e-mail" });
            }
            console.log("initialize function -> before try statement");
            try {
                console.log("initialize function -> inside try statement");
                if (await bcrypt.compare(password, user[0].password)) {
                    console.log("initialize function -> after if statement");
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Wrong Password" })
                }
            } catch(error) {
                return done(error);
            }
        })()
    }
    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
    passport.serializeUser((user, done) => {
        console.log("serializeUser -> user", user[0].id);
        return done(null, user[0].id);
    })
    passport.deserializeUser(async (id, done) => {
        return done(null, await findUserById(id))
    })
}
module.exports = initialize;