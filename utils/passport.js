// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const passport = require('passport');
// const dotenv = require("dotenv");

// dotenv.config();

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,     
//     clientSecret: process.env.CLIENT_SECRET, 
//     callbackURL: `http://localhost:8800${process.env.API_URL}/mentees/auth/google/callback`,
//     passReqToCallback:true
//   },
//   function(accessToken, refreshToken, profile, done) {
//     done(null, profile); 
//   }
// ));

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//     done(null, id); 
// });

// module.exports = passport;


const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const dotenv = require("dotenv");
const Mentee = require('./models/mentee.model'); // Mentee modelini içe aktarın

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `http://localhost:8800${process.env.API_URL}/mentees/auth/google/callback`,
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      // Kullanıcının veritabanında olup olmadığını kontrol edin
      let user = await Mentee.findOne({ googleId: profile.id });

      if (!user) {
        // Kullanıcı veritabanında değilse, yeni bir kullanıcı oluşturun
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
