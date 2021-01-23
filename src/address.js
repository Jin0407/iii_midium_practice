const express = require('express');
const db = require(__dirname + '/__connect_db');
const router = express.Router();

const moment = require('moment-timezone');

// router.use((req, res, next) => {
//     res.locals.title = '通訊錄';

//     const whiteList = ['list', 'login'];
//     console.log(req.url.split('/'));
//     let u = req.url.split('/')[1];
//     if (whiteList.indexOf(u) < 0)
//         // 如果是 edit, del ...
//         if (res.locals.isAdmin) {
//             return next();
//         } else {
//             return res.redirect('/address/list');
//         }
//     next();
// });

router.get('/home', (req, res) => {
    res.locals.title = '首頁';
    res.locals.pageName = 'ad-home';
    res.render('address/home');
});



router.get('/add', (req, res) => {
    res.locals.title = '新增-通訊錄';
    res.locals.pageName = 'ad-add';
    res.render('address/add');
});
router.post('/add', (req, res) => {
    // TODO: 檢查資料格式, 是否必填
    let sql = "INSERT INTO `address`(`name`, `email`, `phone`, `birthday`, `address`,`created`) VALUES (?,?,?,?,?,NOW())";
    const output = {
        success: false,
        postData: req.body
    };
    db.query(sql, [
        req.body.name,
        req.body.email,
        req.body.phone,
        req.body.birthday,
        req.body.address
    ], (error, results) => {
        if (error) {
            console.log(error);
            output.error = error;
        } else {
            output.success = true;
            output.results = results;
        }
        res.json(output);
    });

});
//上面的另一種寫法
// req.body.created_at = new Date();

// const sql = "INSERT INTO `address_book` SET ?";
// db.query(sql,  req.body , (error, results)=>{.......


router.get('/delete/:sid', (req, res) => {
    let sql = "DELETE FROM `address` WHERE `address`.`sid` = ?";
    db.query(sql, [req.params.sid], (error, results) => {
        console.log('delete:', results);
        //res.json(results);
        //res.send(req.header('Referer'));
        res.redirect(req.header('Referer')); //重新回到原來頁面
    })
});

router.get('/edit/:sid', (req, res) => {
    let sql = "SELECT * FROM `nihon` WHERE `address`.`sid` = ?";
    db.query(sql, [req.params.sid], (error, results) => {
        if (results && results.length === 1) {
            // res.json(results);
            results[0].birthday = moment(results[0].birthday).format('YYYY-MM-DD');
            res.render('address/edit', { row: results[0] });
        } else {
            res.redirect('/address/list');
        }
    })
});

//escript 最新寫法:async,await 後兩種寫法較好閱讀(?)
router.post('/edit/:sid', async (req, res) => {
    // TODO: 可以先判斷資料是否符合規則
    const output = {
        success: false,
        info: '',
        postData: req.body,
    };

    const s_sql = "SELECT 1 FROM `address_book` WHERE email=? AND sid <> ? ";
    const r1 = await db.queryAsync(s_sql, [req.body.email, req.params.sid]);

    if (r1.length) {
        output.info = 'Email 資料重複';
        return res.json(output);
    }

    const sql = "UPDATE `address_book` SET ? WHERE sid=?";
    const r2 = await db.queryAsync(sql, [req.body, req.params.sid]);

    if (r2.changedRows === 1) {
        output.info = '編輯成功';
        output.success = true;
    } else {
        output.info = '資料沒有變更';
    }
    res.json(output);
});
//async queryasync then
router.post('/editOld2/:sid', (req, res) => {
    // TODO: 可以先判斷資料是否符合規則
    const output = {
        success: false,
        info: '',
        postData: req.body,
    };
    const s_sql = "SELECT 1 FROM `address` WHERE email=? AND sid<>?";
    db.queryAsync(s_sql, [req.body.email, req.params.sid])
        .then(results => {
            if (results.length) {
                output.info = 'Email 資料重複';
                res.json(output);
            } else {
                const sql = "UPDATE `address` SET ? WHERE sid=?"
                return db.queryAsync(sql, [req.body, req.params.sid]);
            }
        })
        .then(results => {
            if (results.changedRows === 1) {
                output.info = '編輯成功';
                output.success = true;
            } else {
                output.info = '資料沒有變更';
            }
            res.json(output);
        })
        .catch(error => {
            output.info = '更新資料錯誤';
            output.error = error;
            res.json(output);
        })
});
//層層query的寫法
router.post('/editOld1/:sid', (req, res) => {
    // TODO: 可以先判斷資料是否符合規則
    const output = {
        success: false,
        info: '',
        postData: req.body,
    };
    const s_sql = "SELECT 1 FROM `address` WHERE email=? AND sid<>?";
    db.query(s_sql, [req.body.email, req.params.sid], (error, results) => {
        if (results.length) {
            output.info = 'Email 資料重複';
            res.json(output);
        } else {
            const sql = "UPDATE `address` SET ? WHERE sid=?"
            db.query(sql, [req.body, req.params.sid], (error, results) => {
                if (error) {
                    output.info = '更新資料錯誤';
                    output.error = error;
                    res.json(output);
                } else {
                    if (results.changedRows === 1) {
                        output.info = '編輯成功';
                        output.success = true;
                    } else {
                        output.info = '資料沒有變更';
                    }
                    res.json(output);
                }
            })
        }
    })
});

router.get('/imganal', (req, res) => {
    res.locals.pageName = 'imganal';
    res.render('imganal');
});
router.get('/luis', (req, res) => {
    res.locals.pageName = 'luis';
    res.render('luis');
});
router.get('/comVs', (req, res) => {
    res.locals.pageName = 'comVs';
    res.render('comVs');
});
router.get('/mongo', (req, res) => {
    res.locals.pageName = 'mongo';
    res.render('mongo');
});

router.get('/list/:page?', (req, res) => {
    res.locals.pageName = 'ad-list';
    const perpage = 10;
    let tot_row = 0;
    let tot_page = 0;
    let page = req.params.page ? parseInt(req.params.page) : 1;
    const sql = `SELECT * FROM nihon LIMIT ${(page - 1) * perpage},${perpage}`;

    const sql_t = "SELECT  COUNT(1) num FROM nihon ";

    db.query(sql_t, (error, results) => {
        tot_row = results[0].num;  // 總筆數
        tot_page = Math.ceil(tot_row / perpage); // 總頁數

        // TODO: 要排除沒資料的狀況
        if (page < 1) {
            res.redirect('/address/list/1');
            return;
        };
        if (page > tot_page) {
            res.redirect('/address/list/' + tot_page);
            return;
        };


        db.query(sql, (error, results) => {
            const fm = 'YYYY-MM-DD';
            results.forEach(function (el) {
                el.birthday = moment(el.birthday).format(fm);
                // el.birthday = moment(el.birthday).tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');//可以再加時區
            });
            const output = {
                perpage: perpage,
                page: page,
                tot_row: tot_row,
                tot_page: tot_page,
                rows: results
            };
            if (res.locals.isAdmin) {
                res.render('address/list-admin', output);
            } else {
                res.render('address/list', output);
            };
        });

    });

});


router.get('/login', (req, res) => {
    res.locals.pageName = 'ad-login';
    res.render('address/login')
});
router.post('/login', (req, res) => {
    let sql = "SELECT sid, `account`, `nickname` FROM `admins` WHERE  `account`=? AND `password`=SHA1(?)";
    db.queryAsync(sql, [req.body.account, req.body.password])
        .then(results => {
            if (results && results.length === 1) {
                req.session.admin = results[0];
                res.json({
                    success: true,
                    admin: results[0]
                });
            } else {
                res.json({ success: false });
            }
        })
        .catch(error => {
            res.json({
                success: false,
                error: error
            });
        })
});

router.get('/logout', (req, res) => {
    delete req.session.admin;
    res.redirect('/address/login');
});


module.exports = router;