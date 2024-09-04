const passport = require('passport');
const userDb = require('../../model/UserModel');
const bcrypt = require('bcrypt')

// Handler for successful login
exports.loginSuccess = (req, res) => {
  
    if (req.user) {
       
        req.session.user = user
        res.status(200).json({
            error: false,
            message: "Successfully Logged In",
            user: req.user,
        });
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
    }
};

// Handler for login failure
exports.loginFailed = (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
};

// Route to start Google authentication

exports.googleAuth = passport.authenticate('google', {

    scope: ['email', 'profile']
   
});

// Route for Google callback
exports.googleCallback = async (req, res) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) {
            return res.redirect('/login/failed');
        }

        if (!user) {
            return res.redirect('/login/failed');
        }

        try {



                         // Generate  secure random password
      const randomPassword = Math.random().toString(36).slice(-8); 
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
            // Check if the user already exists
            let existingUser = await userDb.findOne({ email: user.emails[0].value });
            
console.log('hashedPassword',randomPassword);

            // If the user does not exist, create a new user
            if (!existingUser) {
                console.log("???????????????????????????????______________________________???????????????????????????");
                existingUser = new userDb({
                    name: user.displayName,
                    email: user.emails[0].value,
                    password: hashedPassword, 
                });
                req.session.user = existingUser
                await existingUser.save();
                req.session.user = existingUser
            }
          
            // Store user information in session
            req.login(existingUser, (err) => {
                if (err) {
                    return res.redirect('/login/failed');
                }
                console.log('+++++++++++++++++++++',existingUser);
                req.session.user = existingUser
                res.redirect('/');
            });
        } catch (error) {
            console.error(error);
            res.redirect('/login/failed');
        }
    })(req, res);
};

// Handler for logout
exports.logout = (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
};
