const EC2 = require('../libraries/ec2');
const FailedToStartServerError = require('./serverErrors');

const getServerInformation = async (state, serverId) => {
  const ec2 = new EC2();
  const serverInformation = await ec2.describeInstance(state, serverId);

  return serverInformation;
};

const startServer = async (serverId) => {
  let { state, ipAddress } = await getServerInformation('instanceExists', serverId);

  if ((state === 'stopped') || (state === 'shutting-down')) {
    const ec2 = new EC2();
    await ec2.startInstance(serverId);

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

const stopServer = async (serverId) => {
  let { state } = await getServerInformation('instanceExists', serverId);

  if ((state === 'running') || (state === 'pending')) {
    const ec2 = new EC2();
    await ec2.stopInstance(serverId);
    state = 'stopping';
  }

  return { state };
};

module.exports = {
  getServerInformation,
  startServer,
  stopServer,
};
