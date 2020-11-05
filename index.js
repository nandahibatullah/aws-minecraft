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

const getInstanceInformation = async (client) => {
  const params = {
    InstanceIds: [`${config.get('serverId')}`],
  };
  const instancesInformation = await client.describeInstances(params).promise();
  const reservations = instancesInformation.Reservations;
  const instances = reservations[0].Instances;

  console.log('\nSERVER INSTANCES\n');
  console.log(`${JSON.stringify(instances)}`);
  console.log('\n');

  return instances[0];
};

const stopServer = async (client) => {
  const instance = await getInstanceInformation(client);
  let message = 'ERROR';

  if (instance) {
    const state = instance.State;
    const stateName = state.Name;

    if ((stateName === 'running') || (stateName === 'pending')) {
      const params = {
        InstanceIds: [`${config.get('serverId')}`],
      };
      const stopInstanceResponse = await client.stopInstances(params).promise();

      console.log('\nAWS EC2 STOP\n');
      console.log(`${JSON.stringify(stopInstanceResponse)}`);
      console.log('\n');
      message = 'stopping server...';
    } else if (stateName === 'stopped') {
      message = 'server stopped';
    }
  }

  return message;
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
  const errors = [];
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
        errors,
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

  if (password === config.get('serverPassword')) {
    const ec2 = new AWS.EC2({
      region: config.get('serverRegion'),
    });
    body.message = await stopServer(ec2);
    res.status(200).render('pages/index', {
      body,
      path: req.path,
      errors: req.flash('error')
    });
  } else {
    req.flash('error', 'Password Incorrect!');
    res.redirect('/stopMCServer');
  }
});

app.listen(config.get('port'), () => console.log(`Example app listening on port ${config.get('port')}!`));
