var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');
var passCatModel = require('../modules/password_category');
var passModel = require('../modules/add_password');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const getPassCat = passCatModel.find({});
const getAllPass = passModel.find({});
/* GET home page. */

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function checkLoginUser(req, res, next) {
    var userToken = localStorage.getItem('userToken');
    try {
        var decoded = jwt.verify(userToken, 'loginToken');
    } catch (err) {
        res.redirect('/');
    }
    next();
}

router.get('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');

    res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors: '', success: '' });
});

router.post('/', checkLoginUser, [check('passwordCategory', 'Enter Password Category Name').isLength({ min: 1 })], function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors: errors.mapped(), success: '' });

    } else {
        var passCatName = req.body.passwordCategory;
        console.log(passCatName);
        var passcatDetails = new passCatModel({
            password_category: passCatName
        });

        passcatDetails.save(function (err, doc) {
            if (err) throw err;
            res.render('addNewCategory', { title: 'Password Management System', loginUser: loginUser, errors: '', success: 'Password category inserted successfully' });

        })

    }
});

module.exports = router;