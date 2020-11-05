const AWS = require('aws-sdk');
const EC2Helper = require('../helpers/ec2Helper');
const FailedToStartServerError = require('../models/errors/failedToStartServerError');

const EC2Client = new AWS.EC2({
  region: process.env.EC2_REGION,
});

const getServerInformation = async (state, serverId) => {
  const ec2Helper = new EC2Helper(EC2Client);
  const serverInformation = await ec2Helper.describeInstance(state, serverId);

  return serverInformation;
};

const startServer = async (serverId) => {
  let { state, ipAddress } = await getServerInformation('instanceExists', serverId);

  if ((state === 'stopped') || (state === 'shutting-down')) {
    const ec2Helper = new EC2Helper(EC2Client);
    await ec2Helper.startInstance(serverId);

    const serverInformation = await getServerInformation('instanceRunning', serverId);
    state = 'pending';
    ipAddress = serverInformation.ipAddress;
  } else if (state === 'running') {
    ({ state, ipAddress } = await getServerInformation('instanceRunning', serverId));
  } else {
    throw new FailedToStartServerError('Failed to start the the server...');
  }

  return { state, ipAddress };
};

module.exports = {
  getServerInformation,
  startServer,
};
