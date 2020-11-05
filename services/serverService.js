const AWS = require('aws-sdk');
const EC2Helper = require('../helpers/ec2Helper');

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

    ({ state, ipAddress } = await getServerInformation('instanceRunning', serverId));
  } else if (state === 'running') {
    ({ state, ipAddress } = await getServerInformation('instanceRunning', serverId));
  } else {
    throw new Error('Failed to start the the server...');
  }

  return ipAddress;
};

module.exports = {
  getServerInformation,
  startServer,
};
