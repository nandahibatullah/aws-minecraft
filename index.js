/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const flash = require('connect-flash');

const serverService = require('./components/serverService.js');

const app = express();
const sessionStore = new session.MemoryStore();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/client/public`));
app.use(cookieParser('secret'));
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret',
}));
app.use(flash());

app.get('/', (req, res) => {
  res.render('pages/index', { errors: req.flash('error') });
});

app.post('/initMCServer', async (req, res) => {
  const body = {};
  const { password } = req.body;
  const serverId = config.get('serverId');

  try {
    if (password === config.get('serverPassword')) {
      const { state, ipAddress } = await serverService.startServer(serverId);

      body.state = state;
      body.ipAddress = ipAddress;

      if (state === 'pending') {
        serverService.startMinecraftProcess(serverId);
      }

      res.status(200).render('pages/index', {
        body,
        path: req.path,
        errors: req.flash('error'),
      });
    } else {
      req.flash('error', 'Password Incorrect!');
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
  }
});

app.post('/stopMCServer', async (req, res) => {
  const body = {};
  const { password } = req.body;
  const serverID = config.get('serverId');

  try {
    if (password === config.get('serverPassword')) {
      const { state } = await serverService.stopServer(serverID);

      body.state = state;
      res.status(200).render('pages/index', {
        body,
        path: req.path,
        errors: req.flash('error'),
      });
    } else {
      req.flash('error', 'Password Incorrect!');
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
  }
});

app.listen(config.get('port'), () => console.log(`Example app listening on port ${config.get('port')}!`));
