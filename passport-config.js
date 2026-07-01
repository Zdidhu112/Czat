const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require("bcryptjs");
const User = require('./db/models/users');

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

  const authenticateUserGoogle = async (
    accessToken,
    refreshToken,
    profile,
    done
  ) => {
    try {

      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(null, false, {
          message: "Google account has no email."
        });
      }

      let user = await User.findOne({
        googleId: profile.id
      });

      if (user) {
        return done(null, user);
      }

      user = await User.findOne({
        email: email
      });

      if (user) {
        user.googleId = profile.id;

        if (!user.picture && profile.photos?.length) {
          user.picture = profile.photos[0].value;
        }

        await user.save();

        return done(null, user);
      }

      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        picture: profile.photos?.[0]?.value
      });

      return done(null, user);

    } catch (err) {
      return done(err);
    }
  };
  const authenticateUserGitHub = async (
    accessToken,
    refreshToken,
    profile,
    done
  ) => {
    try {
      let email = profile.emails?.[0]?.value;

      if (!email) {

            const response = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github+json"
                }
            });

            const emails = await response.json();

            const primary = emails.find(e => e.primary && e.verified);

            if (primary) {
                email = primary.email;
            }
        }
        if (!email) {
            return done(null, false, {
                message: "Nie udało się pobrać adresu e-mail z GitHuba."
            });
        }

      // Szukamy użytkownika po githubId
      let user = await User.findOne({
        githubId: profile.id
      });

      if (user) {
        return done(null, user);
      }

      // Jeśli nie ma githubId, szukamy po e-mailu
      user = await User.findOne({
        email: email
      });

      if (user) {
        user.githubId = profile.id;

        if (!user.picture && profile.photos?.length) {
          user.picture = profile.photos[0].value;
        }

        await user.save();

        return done(null, user);
      }

      // Tworzymy nowego użytkownika
      user = await User.create({
        githubId: profile.id,
        name: profile.displayName || profile.username,
        email: email,
        picture: profile.photos?.[0]?.value
      });

      return done(null, user);

    } catch (err) {
      console.error(err);
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_KEY,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, authenticateUserGoogle))
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  }, authenticateUserGitHub));
  passport.serializeUser((user, done) => done(null, user._id))
  passport.deserializeUser(async (id, done) => {
    return done(null, await getUserById(id))
  })
}


module.exports = initialize