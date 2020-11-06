/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const {
  NodeSSH,
} = require('node-ssh');
require('dotenv').config();
const config = require('config');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const serverService = require('./components/serverService.js');
const { FailedToStartServerError } = require('./components/serverErrors.js');

const app = express();
const ssh = new NodeSSH();
const sessionStore = new session.MemoryStore();

const initServerCommands = async (instanceIp) => {
  try {
    const keyString = config.get('sshKey').replace(/\\n/g, '\n');
    const params = {
      host: instanceIp,
      username: 'ubuntu',
      privateKey: keyString,
    };

    await ssh.connect(params);
    await ssh.execCommand(`./start.sh ${config.get('memoryAllocation')}`);
    ssh.dispose();
  } catch (error) {
    console.log('Error running server commands');
    console.log(error);
  }
};

const waitForServerOK = async (instanceIp) => {
  const client = new AWS.EC2({
    region: config.get('serverRegion'),
  });
  try {
    const params = {
      InstanceIds: [
        `${config.get('serverId')}`,
      ],
    };

    const statusCheckResponse = await client.waitFor('instanceStatusOk', params).promise();
    const instanceStatuses = statusCheckResponse.InstanceStatuses;
    const instanceStatus = instanceStatuses[0].InstanceStatus;
    const status = instanceStatus.Status;
    const checksPassed = status === 'ok';

    if (checksPassed) {
      initServerCommands(instanceIp);
    } else {
      throw new Error('An error has occurred booting the server');
    }
  } catch (error) {
    console.log(error);
  }
};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false,
}));
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
  const serverID = config.get('serverId');

  try {
    if (password === config.get('serverPassword')) {
      const { state, ipAddress } = await serverService.startServer(serverID);

      body.state = state;
      body.ipAddress = ipAddress;
      waitForServerOK(ipAddress);

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
    if (error instanceof FailedToStartServerError) {
      req.flash('error', error.message);
      res.redirect('/');
    } else {
      res.status(502).send(error.message);
    }
  }
});

app.post('/stopMCServer', async (req, res) => {
  const body = {};
  const { password } = req.body;
  const serverID = config.get('serverId');

  try {
    if (password === config.get('serverPassword')) {
      const { state } = await serverService.startServer(serverID);

      body.state = state;
      res.status(200).render('pages/index', {
        path: req.path,
      });
    } else {
      req.flash('error', 'Password Incorrect!');
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(502).send(error.message);
  }
});

app.listen(config.get('port'), () => console.log(`Example app listening on port ${config.get('port')}!`));
