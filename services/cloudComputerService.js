const AWS = require('aws-sdk');
const EC2Helper = require('../helpers/ec2Helper');

const EC2Client = new AWS.EC2({
  region: process.env.EC2_REGION,
});

const getCloudComputerInformation = async (state, cloudComputerId) => {
  const ec2Helper = new EC2Helper(EC2Client);
  const cloudComputerInformation = await ec2Helper.describeInstance(state, cloudComputerId);

  return cloudComputerInformation;
};

module.exports = {
  getCloudComputerInformation,
};
