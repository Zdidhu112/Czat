if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require('./db/models/users');
const { createUser } = require("./controller/actions");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)

    }
  }

  const authenticateUserGoogle = async (accessToken, refreshToken, profile, done) => {
    console.log("auth")
    console.log(profile)
    try {
      let user = await User.findOne({ googleId: profile.id })
      console.log(user);
      if (user) {
        return done(null, user)
      } else {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          picture: profile.photos?.[0]?.value
        });

        console.log(user);
        return done(null, user);

      }
    } catch (e) {
      console.log(e);
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_KEY,
    callbackURL: 'http://localhost:3000/oauth2/redirect/google'
  }, authenticateUserGoogle))
  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (id, done) => {
    return done(null, await getUserById(id))
  })
}


module.exports = initialize