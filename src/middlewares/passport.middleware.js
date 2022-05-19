const AccountModel = require('../models/users/account.model');
const UserModel = require('../models/users/user.model')
const jwt = require('jsonwebtoken')
var GooglePlusStrategy = require('passport-google-token').Strategy;
const passport = require("passport")


// authentication with JWT
const jwtAuthentication = async (req, res, next) => {
    try {
        res.locals.isAuth = false
        let token = req.cookies.access_token;
        //if not exist cookie[access_token] -> isAuth = false -> next
        //verify jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded) {
            const { account } = decoded.sub;
            const acc = await AccountModel.findById(account);
            const user = await UserModel.findOne({ account: account })
            if (user) {
                res.locals.isAuth = true;
                req.user = user;
                req.account = acc;
            }
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized.',
            error,
        });
    }
}
// const jwtAuthentication = async (req, res, next) => {
//     try {
//         res.locals.isAuth = false
//         let authorization = req.headers.authorization;
//         let token = authorization.split(" ")[1]
//         //if not exist cookie[access_token] -> isAuth = false -> next
//         if (!token) {
//             next();
//             return;
//         }
//         //verify jwt
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         if (decoded) {
//             const { account } = decoded.sub;
//             const acc = await AccountModel.findById(account);
//             const user = await UserModel.findOne({ account: account })
//             if (user) {
//                 res.locals.isAuth = true;
//                 req.user = user;
//                 req.account = acc;
//             }
//         }
//         next();
//     } catch (error) {
//         return res.status(401).json({
//             message: 'Unauthorized.',
//             error,
//         });
//     }
// }

const isAdmin = async (req, res, next) => {
    try {
        const account = req.account
        res.locals.isAdmin = true
        // check role
        if (account.role !== "admin") {
            return res.status(401).json({ message: "Not permitted" })
        }
        next()
    } catch (error) {
        console.log('> error :', error)
        return res.status(401).json({
            message: 'Unauthorized.',
            error,
        });
    }
}

const isTeacher = async (req, res, next) => {
    try {
        const account = req.account
        res.locals.isTeacher = true
        // check role
        if (account.role !== "teacher") {
            return res.status(401).json({ message: "Not permitted" })
        }
        next()
    } catch (error) {
        console.log('> error :', error)
        return res.status(401).json({
            message: 'Unauthorized.',
            error,
        });
    }
}

const jwtAuthenticationOrNull = async (req, res, next) => {
    try {
        let authorization = req.headers.authorization;
        if (!authorization) {
            next()
            return
        }
        let token = authorization.split(" ")[1]

        if (!token) {
            next();
            return;
        }
        // verify jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded) {
            const { account } = decoded.sub;
            const acc = await AccountModel.findById(account).lean();
            const user = await UserModel.findOne({ account: account }).lean()
            if (user) {
                res.locals.isAuth = true;
                req.user = user;
                req.account = acc;
            }
        }

        next();
    } catch (error) {
        next()
    }
}

const authPage = permissions => {
    return (req, res, next) => {
        const account = req.account
        // nếu account có role đc cho phép thì next()
        if (!permissions.includes(account.role)) {
            return res.status(401).json({ message: "You don't have permission" })
        }
        next()
    }
}

passport.use(new GooglePlusStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const { id, name } = profile
            const { familyName, givenName } = name;
            const email = profile.emails[0].value;
            var user = null, account = null
            // check exist email account
            account = await AccountModel.findOne({ email })
            if (account) {
                user = await UserModel.findOne({ account: account._id })
            } else {
                // tạo account và user tương ứng
                account = await AccountModel.create({ email, password: email })
                user = await UserModel.create({ account: account._id, fullName: familyName + " " + givenName })
            }
            // req.user = account, req.authInfo = user
            done(null, user, account)
        } catch (error) {
            console.log(error);
            done(error, false)
        }
    }
));

module.exports = {
    jwtAuthentication,
    isAdmin,
    isTeacher,
    jwtAuthenticationOrNull,
    authPage
}