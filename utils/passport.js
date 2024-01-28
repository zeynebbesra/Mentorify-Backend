const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,     // Google Developer Console'dan alınan Client ID
    clientSecret: process.env.CLIENT_SECRET, // Google Developer Console'dan alınan Client Secret
    callbackURL: "/auth/google/callback" // Google tarafından kullanıcıyı yönlendireceği callback URL
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile); //doğrudan profil bilgilerini kullanıyoruz
  }
));

// Kullanıcıyı session'a kaydetmek için
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Session'dan kullanıcıyı çıkarmak için
passport.deserializeUser(function(id, done) {
    done(null, user); //basitçe kullanıcıyı geri döndürüyoruz
});

module.exports = passport;