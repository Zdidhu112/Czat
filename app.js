if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const {createUser, findUserByEmail, findUserById, findUsersAll} = require("./controller/actions");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

require('./db/mongoose');
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.set("trust proxy", 1);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax"
  }
});
app.use(sessionMiddleware);
const initializePassport = require("./passport-config");
initializePassport(passport, 
    email => findUserByEmail(email),
    id => findUserById(id),
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes/root'));


app.all('/*split', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'public', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined;
    if (isHandshake) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}

io.engine.use(onlyForHandshake(sessionMiddleware));
io.engine.use(onlyForHandshake(passport.initialize()));
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
  onlyForHandshake((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.writeHead(401);
      res.end();
    }
  }),
);
const initializeSocket = require("./socket/socket");
initializeSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, (err) => {
    if (err) console.error(err);
    console.log(`Aplikacja nasłuchuje na porcie: ${PORT}`);
})