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

function checkUsername(req, res, next) {
    var uname = req.body.uname;
    var checkexitemail = userModule.findOne({ username: uname });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Username Already Exit' });
        }
        next();
    });
}

function checkEmail(req, res, next) {
    var email = req.body.email;
    var checkexitemail = userModule.findOne({ email: email });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Email Already Exit' });
        }
        next();
    });
}

/**
router.get('/view-all-password', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var perPage = 3;
  var page = req.params.page || 1;

  getAllPass.clone().skip((perPage * page) - perPage).limit(perPage).exec(function (err, data) {
    if (err) throw err;

    passModel.countDocuments({}).exec((err, count) => {
      res.render('view-all-password', { title: 'Password Management System', loginUser: loginUser, records: data, current: page, pages: Math.ceil(count / perPage) });
    });
  });
});

router.get('/view-all-password/:page', checkLoginUser, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');

  var perPage = 3;
  var page = req.params.page || 1;

  getAllPass.clone().skip((perPage * page) - perPage).limit(perPage).exec(function (err, data) {
    if (err) throw err;

    passModel.countDocuments({}).exec((err, count) => {
      res.render('view-all-password', { title: 'Password Management System', loginUser: loginUser, records: data, current: page, pages: Math.ceil(count / perPage) });
    });
  });
});
*/

router.get('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');

    passModel.aggregate([
        {
            $lookup:
            {
                from: "password_categories",
                localField: "password_category",
                foreignField: "password_category",
                as: "pass_cat_details"
            }
        },
        { $unwind: "$pass_cat_details" }

    ]).exec(function (err, results) {
        if (err) throw err;
        console.log(results);
        res.send(results);
    });
});

router.get('/edit/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var getPassDetails = passModel.findById({ _id: id });

    getPassDetails.exec(function (err, data) {
        if (err) throw err;
        getPassCat.clone().exec(function (err, data1) {
            res.render('edit_password_detail', { title: 'Password Management System', loginUser: loginUser, success: '', records: data1, record: data });
        });
    });
});

router.post('/edit/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var password_cat = req.body.password_cat;
    var project_name = req.body.project_name;
    var password_details = req.body.password_details;

    passModel.findByIdAndUpdate(id, { password_category: password_cat, project_name: project_name, password_detail: password_details }).exec(function (err) {
        if (err) throw err;
        var getPassDetails = passModel.findById({ _id: id });
        getPassDetails.exec(function (err, data) {
            if (err) throw err;
            getPassCat.clone().exec(function (err, data1) {
                res.render('edit_password_detail', { title: 'Password Management System', loginUser: loginUser, success: 'Password Updated Successfully', records: data1, record: data });
            });
        });
    });
});

router.get('/delete/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var id = req.params.id;
    var passdelete = passModel.findByIdAndDelete(id);
    passdelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/view-all-password')
    });
});

module.exports = router;