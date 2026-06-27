const express = require("express");
const router = express.Router()
const bcrypt = require("bcryptjs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const path = require('path');


const {createUser, findUserByEmail, findUserById, findUsersAll} = require("./../controller/actions");
const initializePassport = require("./../passport-config");
initializePassport(passport, 
    email => findUserByEmail(email),
    id => findUserById(id),
);
findUsersAll();

router.use(flash());
router.use(session(
  {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }
))


router.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '..','public', 'index.html'));
})

router.get('/chat', checkAuthenticated, (req, res)=>{
    res.sendFile(path.join(__dirname, '..','public', 'chat.html'));
})

router.get('/login',checkNotAuthenticated,  (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
})
router.post('/login', checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
router.get('/login/google', passport.authenticate('google', { scope:
    [ 'profile','email' ] }
));
router.get('/oauth2/redirect/google', 
    passport.authenticate('google', {
        failureRedirect: '/login'
}), (req, res)=>{
    console.log("redirecting..")
    res.redirect('/');
})

router.get('/sign', checkNotAuthenticated, (req, res)=>{
        res.sendFile(path.join(__dirname, '..', 'public', 'sign.html'));

})
router.post('/register',checkNotAuthenticated, async (req,res)=>{
    try {
        const existingUser = await findUserByEmail(req.body.email);

        if (existingUser) {
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await createUser({name: req.body.name, email: req.body.email, password: hashedPassword});
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register')
    }
})

router.get("/logout", (req, res, next)=>{
    req.logout(err => {
        if(err) return next(err);
        res.redirect("/login");
      });
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = router;