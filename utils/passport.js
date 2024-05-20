const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const dotenv = require("dotenv");

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,     
    clientSecret: process.env.CLIENT_SECRET, 
    callbackURL: `http://localhost:8800${process.env.API_URL}/mentees/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile); 
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null, id); 
});

module.exports = passport;
