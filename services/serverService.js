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

module.exports = {
  getServerInformation,
};
