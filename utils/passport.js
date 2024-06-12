const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const dotenv = require("dotenv");
const Mentee = require('../models/mentee.model');

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `http://localhost:8800${process.env.API_URL}/mentees/auth/google/callback`,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      let user = await Mentee.findOne({ googleId: profile.id });
      console.log("profile",profile)
      console.log("profile id:", profile.id)
      if (!user) {
        // Kullanıcı veritabanında değilse, yeni bir kullanıcı oluştur
        user = new Mentee({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.name.givenName,
          surname: profile.name.familyName,
          avatar: profile.photos[0].value,
          desc: "Google user"
        });
        await user.save();
      }
      console.log("USER:",user)

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await Mentee.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
