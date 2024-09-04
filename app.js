const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const env = require('dotenv');
const session = require('express-session');
const adminRoute = require('./routes/adminRoute');
const usersRouter = require('./routes/usersRoute');
const multer = require('multer');
const { v4: uuidv4 } = require("uuid");

// Authentication-related imports
const cors = require('cors');
const passport = require('passport');
const authRoute = require('./routes/auth');
const passportStrategy = require('./config/passport');
const mongoconnect = require("./config/mongodbconnection");

const app = express();
env.config();

// Session management
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Disable caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Set up port
const PORT = process.env.PORT || 8000;

// View engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Middleware setup
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/', usersRouter);
app.use('/auth', authRoute);
app.use('/', adminRoute);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handling middleware
// app.use(function(err, req, res, next) {
//   // Set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // Render the error page
//   res.status(err.status || 500);

//   // Check if request expects HTML or JSON
//   if (req.accepts('html')) {
//     res.render('error'); // Render an error view if available
//   } else if (req.accepts('json')) {
//     res.json({ error: err.message }); // Respond with JSON for API requests
//   } else {
//     res.type('txt').send(err.message); // Respond with plain text for others
//   }
// });


app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
