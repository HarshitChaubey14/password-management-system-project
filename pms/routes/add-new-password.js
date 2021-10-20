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
        res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success: "" });
    });
});

router.post('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var p_cat = req.body.password_cat;
    var pro_name = req.body.project_name;
    var p_details = req.body.password_details;

    var password_details = new passModel({
        password_category: p_cat,
        project_name: pro_name,
        password_detail: p_details
    });

    password_details.save(function (err, doc) {
        getPassCat.clone().exec(function (err, data) {
            if (err) throw err;
            res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success: "Password Details Inserted Successfully" });
        });
    });
});

module.exports = router;