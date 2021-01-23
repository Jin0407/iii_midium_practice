const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads' });
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const exec = require("child_process").exec;



app.set('view engine', 'ejs');

// 解析 post urlencoded 的 middleware
app.use(express.urlencoded({ extended: false }));

// 解析 json 的 middleware
app.use(express.json());

//session
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: '123456',
    cookie: {
        maxAge: 120000,
    }
}));
app.use(cors());

// 自訂 middleware
app.use((req, res, next) => {
    res.locals.pageName = '';
    res.locals.isAdmin = false;
    req.query.from_middleware = 'hello';
    if (req.session.admin && req.session.admin.account) {
        res.locals.admin = req.session.admin;
        res.locals.isAdmin = true;
    }
    next();
});



//連線資料庫
//const db = require(__dirname + '/__connect_db');

//const mongoose = require(__dirname + '/__connect_mongo');




app.use('/address', require(__dirname + '/address'));


//靜態資料夾 大家都可以來拿
app.use(express.static('public'));

//run python
function exec_python() {
    console.log("run py");
    // exec('python C:/test/test.py', function (error, stdout, stderr) {
    exec('python C:/Users/Student/Documents/iii/midiumProject/aien0727/src/prj1/111.py', function (error, stdout, stderr) {
    console.log(stdout)
    });
};

//連到這網址執行python(上面的)然後導向元網址
app.get('/runSelenium', (req, res) => {
    exec_python();
    console.log("開始爬蟲")
    res.redirect('/address/list');
});


//設定伺服器狀態
app.use((req, res) => {
    // res.type('text/html');
    res.status(404);
    res.send('<h1>404 not found</h1>');
});


app.listen(3000, () => {
    console.log('server on');
});





