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
    getPassCat.clone().exec(function (err, data) {
        if (err) throw err;
        res.render('password_category', { title: 'Password Management System', loginUser: loginUser, errors: '', success: '', records: data });
    });
});

router.get('/delete/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.params.id;
    var passdelete = passCatModel.findByIdAndDelete(passcat_id);
    passdelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/passwordCategory')
    });
});

router.get('/edit/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.params.id;
    var getpassCategory = passCatModel.findById(passcat_id);
    getpassCategory.exec(function (err, data) {
        if (err) throw err;
        res.render('edit_pass_category', { title: 'Password Management System', loginUser: loginUser, errors: '', success: '', records: data, id: passcat_id });
    });
});

router.post('/edit/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.body.id;
    var passwordCategory = req.body.passwordCategory;
    var update_passCat = passCatModel.findByIdAndUpdate(passcat_id, { password_category: passwordCategory });

    update_passCat.exec(function (err, doc) {
        if (err) throw err;
        res.redirect('/passwordCategory');
    });
});

module.exports = router;