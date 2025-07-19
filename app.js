// 1⃣ Load your .env immediately (only once!)
require('dotenv').config({ path: 'C:/Users/USR/verve-e-commerse/.env' });
const fs           = require('fs');
const path         = require('path');
const express      = require('express');
const createError  = require('http-errors');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const session      = require('express-session');
const { v4: uuidv4 } = require('uuid');
const passport     = require('passport');

require('./config/passport');
// Optional: debug that the env vars loaded
console.log('GOOGLE_CLIENT_ID:',    process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:',process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
const usersRouter = require('./routes/usersRoute');
const authRoute   = require('./routes/auth');
const adminRoute  = require('./routes/adminRoute');
const mongoconnect= require('./config/mongodbconnection');
const app = express();

// Set the view engine (e.g., EJS)
app.set('view engine', 'ejs');

// Specify the directory for view templates
app.set('views', path.join(__dirname, 'views'));

// Session management
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30*24*60*60*1000 }  // 30 days
}));
// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
// Standard middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/',      usersRouter);
app.use('/auth',  authRoute);
app.use('/',      adminRoute);
// 404 handler
app.use((req, res, next) => next(createError(404)));
// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`http://localhost:3000 ${PORT}`));






