var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sequelize = require('./config/db');
const dotenv = require("dotenv");
dotenv.config({ path: "back/.env" });

var app = express();


//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
var flightRouter = require('./routes/flights');
var authRouter = require('./routes/authRoute');


const PORT = process.env.PORT || 3000;


// 모델 임포트
const db = require('./models'); // 모델을 임포트 (여기서 동기화도 이루어짐)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/flights', flightRouter);
app.use('/auth', authRouter);

const Flight = require('./models/Flight');


sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected successfully');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Models synced');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
