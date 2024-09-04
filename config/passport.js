const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');

// Configure the Google strategy for passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
            callbackURL: "/auth/google/callback",  // Path relative to your server
            scope: ['profile', 'email']
        },
        function(accessToken, refreshToken, profile, callback) {
            console.log('Profile data');
            console.log(profile);
            // You should handle user storage here
            
            return callback(null, profile);
        }
    )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
    // console.log("++++++++++++++++++++++++++++++++++++++++++++++",user);

    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user);
});
