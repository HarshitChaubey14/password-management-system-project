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

    var options = {
        offset: 1,
        limit: 3
    };

    passModel.paginate({}, options).then(function (result) {

        res.render('view-all-password', { title: 'Password Management System', loginUser: loginUser, records: result.docs, current: result.offset, pages: Math.ceil(result.total / result.limit) });
    });
});

router.get('/:page', checkLoginUser, function (req, res, next) {
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