/* eslint-disable no-console */
const { NodeSSH } = require('node-ssh');
const config = require('config');
const EC2 = require('../libraries/ec2');
const { FailedToStartMinecraftProcessError } = require('./serverErrors');

const exectuteSSHCommand = async (serverIp, command, options) => {
  console.log(`executing ssh command: ${command} with options ${options} on ${serverIp}`);
  const ssh = new NodeSSH();
  const keyString = config.get('sshKey').replace(/\\n/g, '\n');
  const opts = options.join(' ');
  const params = {
    host: serverIp,
    username: 'ubuntu',
    privateKey: keyString,
  };

  await ssh.connect(params);
  await ssh.execCommand(`${command} ${opts}`);
  ssh.dispose();
  console.log('ssh command executed');
};

const getServerInformation = async (state, serverId) => {
  const ec2 = new EC2();
  const serverInformation = await ec2.describeInstance(state, serverId);

  return serverInformation;
};

const getServerStatusInformation = async (state, serverId) => {
  const ec2 = new EC2();
  const serverStatusInformation = await ec2.describeInstanceStatus(state, serverId);

  return serverStatusInformation;
};

const startServer = async (serverId) => {
  let { state, ipAddress } = await getServerInformation('instanceExists', serverId);

  if ((state === 'stopped') || (state === 'stopping')) {
    await getServerInformation('instanceStopped', serverId);

    const ec2 = new EC2();
    await ec2.startInstance(serverId);

    const serverInformation = await getServerInformation('instanceRunning', serverId);

    state = 'pending';
    ipAddress = serverInformation.ipAddress;
  } else if (state === 'running') {
    ({ state, ipAddress } = await getServerInformation('instanceRunning', serverId));
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

const startMinecraftProcess = async (serverId) => {
  console.log('startingMinecraftProcess...');
  const { status } = await getServerStatusInformation('instanceStatusOk', serverId);
  const serverInformation = await getServerInformation('instanceRunning', serverId);
  const command = './start.sh';
  const options = [config.get('memoryAllocation')];

  if (status === 'ok') {
    await exectuteSSHCommand(serverInformation.ipAddress, command, options);
  } else {
    throw new FailedToStartMinecraftProcessError('status not \'ok\'');
  }
};

module.exports = {
  getServerInformation,
  startServer,
  stopServer,
  startMinecraftProcess,
};
