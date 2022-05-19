var express = require('express');
var courseApis = express.Router();
const rateController = require('../controllers/rate.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: đánh giá của khoá học
courseApis.post('/', passport.jwtAuthentication, rateController.postRate)

courseApis.put('/:id', passport.jwtAuthentication, rateController.putRate)


module.exports = courseApis