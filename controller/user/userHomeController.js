const userDb = require('../../model/UserModel');
const generateOTP = require('../../utils/otp');
const { mailTransporter, sendEmail } = require('../../utils/nodemailer');
const bcrypt = require('bcrypt');
const productModel = require("../../model/productModel")
const categoryModel = require("../../model/CategoryModel");
const cartModel = require('../../model/cartModel')

// Set OTP expiration time in milliseconds 
const OTP_EXPIRATION_TIME = 120 * 1000; // 30 seconds

module.exports = {

  ShowHomePage: async (req, res) => {
    const userInfo = req.session.user;
    var products = await productModel.find()
      .populate("category")
    const category = await categoryModel.find()
    console.log('userInfouserInfo', userInfo);

    try {


      // var cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId')
      if (!userInfo) {

        res.render('user/webHome', { userInfo, products, category });
      } else {
      //   const cart = new cartModel({
      //     userId: req.session.user._id,
      // });
      var cart = await cartModel.findOne({ userId: req.session.user._id}).populate('cartProducts.productId')

      // await cart.save();
      console.log('userInfo',userInfo);
      console.log('products',products);
      console.log('cart',cart);
   
      
        res.render('user/webHome', { userInfo, products,category,});

      }

    } catch (error) {
      console.log(error);

    }





  },

  renderOtpPage: (req, res) => {
    const err = req.session.err;
    req.session.err = null;
    console.log("_________________________errr");
    console.log(err);
    console.log("_________________________");
    res.render("user/otp", { err });
  },

  ShowLoginPage: (req, res) => {
    const noUser = req.session.error;
    req.session.error = null;
    res.render('user/userLogin', { noUser });
  },

  ShowSignUpPage: (req, res) => {
    const userExists = req.session.userExist;
    req.session.userExist = null;
    res.render("user/signupForm", { userExists });
  },

  registerUserDb: async (req, res) => {
    console.log("bbbbbb", req.body);
    try {
      const { name, email, pass } = req.body;

      // Store req.body in session using temp variable
      req.session.userDetails = { name, email, pass };

      const userExist = await userDb.findOne({ email: email });
      console.log("kittandoo", userExist);
      // Pass one error message to frontend
      if (userExist) {
        console.log("already in");

        req.session.userExist = "User already exists";
        return res.redirect('/user-signup');
      } else {
        const { otpcode } = await generateOTP();

        console.log('otp set', otpcode);

        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: email,
          subject: "Your OTP Code",
          text: `Here is your OTP code: ${otpcode}`,
        };
        sendEmail(mailOptions);

        // Set OTP and expiration time
        req.session.storeOtp = otpcode;
        req.session.otpExpiration = Date.now() + OTP_EXPIRATION_TIME;
        req.session.checkOtpVerfy = true;
        res.render('user/otp');
      }

    } catch (error) {
      console.log(error);
    }
  },

  verifyOtp: async (req, res) => {
    console.log("hdhd", req.body);
    const { otp } = req.body;

    try {
      const currentTime = Date.now();
      if (currentTime > req.session.otpExpiration) {
        // OTP expired
        req.session.err = "OTP expired";
        return res.redirect('/otp');
      }

      if (req.session.storeOtp === otp) {
        delete req.session.storeOtp;
        delete req.session.otpExpiration;
        console.log('//////////////////', req.session.userDetails);
        const { name, email, pass } = req.session.userDetails;
        console.log("something");


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(pass, salt);

        // Storing user data in database
        const storingUser = await new userDb({
          name: name,
          email: email,
          password: hashedPassword
        });
        console.log('stored', storingUser);
        await storingUser.save();

        // Store data in session
        req.session.user = storingUser;
        delete req.session.checkOtpVerfy
        delete req.session.otpExpiration
        res.redirect('/');
      } else {
        console.log("error");
        req.session.err = "Invalid OTP";
        res.redirect('/otp');
      }

    } catch (error) {
      console.log(error);
    }
  },

  renderResendPage: async (req, res) => {
    const { name, email, pass } = req.session.userDetails;

    const { otpcode } = await generateOTP();
    console.log("resent otp", otpcode);
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Here is your OTP code: ${otpcode}`,
    };
    sendEmail(mailOptions);

    // Set new OTP and expiration time
    req.session.storeOtp = otpcode;
    req.session.otpExpiration = Date.now() + OTP_EXPIRATION_TIME;

    console.log("hhhhhhhhhhhh");
    res.render("user/otp");
  },
userLogin: async (req, res) => {
    const { email, pass } = req.body;

    try {
        const user = await userDb.findOne({ email: email });

        if (!user) {
            req.session.error = "Invalid E-mail Id";
            return res.redirect('/user-login');
        }

        if (!user.status) {
            req.session.error = "E-mail id has been blocked. Try again with another e-mail.";
            return res.redirect('/user-login');
        }

        // Log the password and user password (hashed)
        console.log("Entered password:", pass);
        console.log("Stored hashed password:", user.password);

        // Compare the provided password with the stored hashed password
        const isValid = await bcrypt.compare(pass, user.password);
        console.log("Password valid:", isValid);

        if (isValid) {
            req.session.user = user;
            res.redirect('/');
        } else {
            req.session.error = "Invalid Password";
            res.redirect('/user-login');
        }
    } catch (error) {
        console.error("Login error:", error);
        req.session.error = "An error occurred. Please try again.";
        res.redirect('/user-login');
    }
},

  userLogout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to destroy session');
      }
      res.redirect('/');
    });
  }
};


