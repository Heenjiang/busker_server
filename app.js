const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const albumApi = require('./routes/api/albumApis');
const userApi = require('./routes/api/generaluserApi');
const buskerRouter = require('./routes/api/busker');
const adminRouter = require('./routes/api/admin');
const singleImageUploadRouter = require('./routes/api/singleImageUploadRouter');
const homepagejson = require('./routes/api/homepage');
const moment = require('./routes/api/momentApis');
const trails = require('./routes/api/trailerApis');
const login = require('./routes/api/login');
const register = require('./routes/api/register');
const buskerTrendCalculator = require('./routes/api/trendCaculateApi');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/public",express.static('./public'));
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({  extended: true}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use('/', indexRouter);
app.use("/", express.static(path.resolve('build')));
app.use('/api/uploadImage',singleImageUploadRouter);
app.use('/api/login',login);
app.use('/api/register',register);
app.use('/api/homepage',homepagejson);
app.use('/api/user', userApi);
app.use('/api/busker', buskerRouter);
app.use('/api/moment', moment);
app.use('/api/admin', adminRouter);
app.use('/api/trail', trails);
app.use('/api/album', albumApi);
app.user('api/calculate/buskertrend', buskerTrendCalculator);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    //next(createError(404));
    if(req.url.startsWith('/api/')||req.url.startsWith('/static/')){
        return next;
    }
    else{
        return res.sendFile(path.resolve('build/index.html'));
    }
});

// error handler
app.use(function(err, req, res, next) {
    //set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3001, function () {
    console.log('App listening on port 3001!');
});

module.exports = app;
