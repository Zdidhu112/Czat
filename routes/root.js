const express = require("express");
const router = express.Router()
const bcrypt = require("bcryptjs");
const passport = require("passport");
const session = require("express-session");
const path = require('path');


const { createUser, findUserByEmail, findUserById, findUsersAll } = require("./../controller/actions");
const {checkAuthenticated, checkNotAuthenticated} = require("../utils/auth-check");
findUsersAll();

router.use("/rooms", require("./rooms"));

router.get('/',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})

router.get('/chat', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'chat.html'));
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
})
router.post('/login', checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: '/chat',
    failureRedirect: '/login',
    failureFlash: true
}))
router.get('/login/google', passport.authenticate('google', {
    scope:
        ['profile', 'email']
}
));
router.get('/login/github',
    passport.authenticate('github', { scope: ['user:email'] }));
router.get('/login/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });
router.get('/oauth2/redirect/google',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }), (req, res) => {
        console.log("redirecting..")
        res.redirect('/chat');
    })

router.get('/sign', checkNotAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'sign.html'));

})
router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const existingUser = await findUserByEmail(req.body.email);

        if (existingUser) {
            return res.redirect('/sign');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await createUser({ name: req.body.username, email: req.body.email, password: hashedPassword });
        res.redirect('/login');
    } catch (error) {
        res.redirect('/sign')
    }
})

router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect("/login");
    });
})


module.exports = router;