require('dotenv').config();

module.exports = {
  memoryAllocation: process.env.MEMORY_ALLOCATION || 1,
  port: process.env.PORT || 3000,
  serverRegion: process.env.EC2_REGION,
  serverId: process.env.INSTANCE_ID,
  serverPassword: process.env.SERVER_PASSWORD,
  sshKey: process.env.SSH_KEY,
  username: 'ubuntu',
};
