/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const {
  NodeSSH,
} = require('node-ssh');
require('dotenv').config();

const app = express();
const ssh = new NodeSSH();

const initServerCommands = async (instanceIp) => {
  try {
    const keyString = process.env.SSH_KEY.replace(/\\n/g, '\n');
    const params = {
      host: instanceIp,
      username: 'ubuntu',
      privateKey: keyString,
    };

    await ssh.connect(params);
    await ssh.execCommand(`./start.sh ${process.env.MEMORY_ALLOCATION || 1}`);
    ssh.dispose();
  } catch (error) {
    console.log('Error running server commands');
    console.log(error);
  }
};

const waitForServerOK = async (instanceIp, client) => {
  try {
    const params = {
      InstanceIds: [
        `${process.env.INSTANCE_ID}`,
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
    InstanceIds: [`${process.env.INSTANCE_ID}`],
  };
  const instancesInformation = await client.describeInstances(params).promise();
  const reservations = instancesInformation.Reservations;
  const instances = reservations[0].Instances;

  console.log('\nSERVER INSTANCES\n');
  console.log(`${JSON.stringify(instances)}`);
  console.log('\n');

  return instances[0];
};

const startServer = async (client) => {
  const instanceInformation = await getInstanceInformation(client);

  let message = 'ERROR';

  if (instanceInformation) {
    const state = instanceInformation.State;
    const stateName = state.Name;

    if ((stateName === 'stopped') || (stateName === 'shutting-down')) {
      const params = {
        InstanceIds: [`${process.env.INSTANCE_ID}`],
      };
      const startInstanceResponse = await client.startInstances(params).promise();

      message = 'ERROR';
      console.log('\nAWS EC2 START\n');
      console.log(`${JSON.stringify(startInstanceResponse)}`);
      console.log('\n');

      const instancesInformation = await client.waitFor('instanceRunning', params).promise();
      const reservations = instancesInformation.Reservations;
      const instances = reservations[0].Instances;
      const instance = instances[0];
      const ipAddress = instance.PublicIpAddress;

      message = `Server is starting, this may take a few minutes.\nIP: ${ipAddress}`;

      waitForServerOK(ipAddress, client);
    } else if (stateName === 'running') {
      message = `IP: ${instanceInformation.PublicIpAddress}`;
    } else {
      message = 'ERROR';
    }
  }

  return message;
};

const stopServer = async (client) => {
  const instance = await getInstanceInformation(client);
  let message = 'ERROR';

  if (instance) {
    const state = instance.State;
    const stateName = state.Name;

    if ((stateName === 'running') || (stateName === 'pending')) {
      const params = {
        InstanceIds: [`${process.env.INSTANCE_ID}`],
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

app.get('/', (req, res) => {
  res.render('pages/index', {
    ipMessage: '',
    path: req.body.path,
  });
});

app.post('/initMCServer', async (req, res) => {
  const {
    password,
  } = req.body;
  let message = 'Password Incorrect!';

  if (password === process.env.SERVER_PASSWORD) {
    const ec2 = new AWS.EC2({
      region: process.env.EC2_REGION,
    });
    message = await startServer(ec2);
  }

  res.render('pages/index', {
    ipMessage: message,
    path: req.path,
  });
});

app.post('/stopMCServer', async (req, res) => {
  const {
    password,
  } = req.body;
  let message = 'Password Incorrect!';

  if (password === process.env.SERVER_PASSWORD) {
    const ec2 = new AWS.EC2({
      region: process.env.EC2_REGION,
    });
    message = await stopServer(ec2);
  }

  res.render('pages/index', {
    ipMessage: message,
    path: req.path,
  });
});

app.listen(process.env.PORT || 3000, () => console.log(`Example app listening on port ${process.env.PORT || 3000}!`));
