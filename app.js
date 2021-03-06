const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');

const albumApi = require('./routes/api/albumApis');
const singlApi = require('./routes/api/singleApi');
const userApi = require('./routes/api/generaluserApi');
const buskerRouter = require('./routes/api/busker');
const adminRouter = require('./routes/api/admin');
const singleImageUploadRouter = require('./routes/api/singleImageUploadRouter');
const homepage = require('./routes/api/homepage');
const moment = require('./routes/api/momentApis');
const trails = require('./routes/api/trailerApis');
const login = require('./routes/api/login');
const register = require('./routes/api/register');
const buskerTrendCalculator = require('./routes/api/trendCaculateApi');
const imageUploadApi = require('./routes/api/imageUpload');
const feedbackApi = require('./routes/api/feedback');
const commentApi = require('./routes/api/commentApis');
const audioUpload = require('./routes/api/audioUplad');
const codeSend = require('./routes/api/sendCaptcha');


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
app.use('/upload', (req, res) => {res.render('layouts/form');})
app.use('/api/uploadImage',singleImageUploadRouter);
app.use('/api/login',login);
app.use('/api/register',register);
app.use('/api/homepage',homepage);
app.use('/api/user', userApi);
app.use('/api/busker', buskerRouter);
app.use('/api/moment', moment);
app.use('/api/admin', adminRouter);
app.use('/api/trail', trails);
app.use('/api/album', albumApi);
app.use('/api/calculate', buskerTrendCalculator);
app.use('/api/image', imageUploadApi);
app.use('/api/feedback', feedbackApi);
app.use('/api/single',singlApi);
app.use('/api/comment', commentApi);
app.use('/api/audioUpload', audioUpload);
app.use('/api/captcha', codeSend);


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
