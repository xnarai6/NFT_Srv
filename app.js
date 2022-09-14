const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql2 = require('mysql2');
var expressSession = require('express-session');
var serveStatic = require('serve-static');
const bodyParser = require('body-parser');
var http = require('http');
const nodemailer = require('nodemailer');

const passportrouter = require('./routes/passport/route');
const passport = require('passport'); // 여기와
const passportConfig = require('./routes/passport/passport'); // 여기

const app = express();

//쿠키와 세션을 미들웨어로 등록한다
app.use(cookieParser());
app.use(
    expressSession({
        secret: 'my key', //이때의 옵션은 세션에 세이브 정보를 저장할때 할때 파일을 만들꺼냐
        //아니면 미리 만들어 놓을꺼냐 등에 대한 옵션들임
        resave: true,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session()); // 세션 연결
passportConfig(); // 이 부분 추가

app.disable('x-powered-by');

app.use(cors());

if (process.env.NODE_ENV === 'production') dotenv.config({ path: './.env.prod' });
if (process.env.NODE_ENV === 'development') dotenv.config({ path: './.env.dev' });
if (process.env.NODE_ENV === 'testing') dotenv.config({ path: './.env.test' });

// mysql 설정
global.mysqlPool = mysql2.createPool(require('./config/mysql.js')).promise();
global.transporter = nodemailer.createTransport({
    port: '465', // true for 465, false for other ports
    host: 'smtp.naver.com',
    auth: {
        user: 'swave123',
        pass: 'swave9999!',
    },
    secure: true,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

logger.token('ko-time', () => new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
app.use(
    logger([':method', ':url', ':status', ':remote-addr', ':ko-time'].join('\t| '), {
        skip: (req) => req.originalUrl.includes('/static/') || req.originalUrl.includes('/assets/') || req.originalUrl.includes('/public/'),
    })
);

// 사용자 session setting
app.use((req, res, next) => {
    res.locals.userInfo = req.session.user;
    res.locals.socialUser = req.user;
    // console.log(res.locals);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.resolve('public')));
app.get('/robots.txt', (req, res, next) => {
    res.type('text/plain');
    res.send(`
    User-agent: Googlebot
    Disallow:
    
    User-agent: Googlebot-image
    Disallow:
    `);
});


app.use('/passport', require('./routes/passport/route'));
app.use('/common', require('./routes/common/commonRouter'));
app.use('/nfts', require('./routes/nfts/nftRouter'));

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('common/error');
});

module.exports = app;
