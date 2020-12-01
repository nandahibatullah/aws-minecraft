/* eslint-disable no-console */
const AWS = require('aws-sdk');
const config = require('config');

module.exports = {
  async describeInstance(state, instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });
    const instancesResponse = await ec2Client.waitFor(state, params).promise();
    const instanceData = instancesResponse.Reservations[0].Instances[0];

    console.log('\nSERVER INSTANCES\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');

    return {
      state: instanceData.State.Name,
      ipAddress: instanceData.PublicIpAddress,
    };
  },

  async describeInstanceStatus(state, instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });
    const instanceStatusesResponse = await ec2Client.waitFor(state, params).promise();
    const instanceStatusData = instanceStatusesResponse.InstanceStatuses[0];

    console.log('\nSERVER INSTANCES\n');
    console.log(`${JSON.stringify(instanceStatusData)}`);
    console.log('\n');

    return {
      status: instanceStatusData.InstanceStatus.Status,
    };
  },

  async startInstance(instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });
    const instancesResponse = await ec2Client.startInstances(params).promise();

    console.log('\nAWS EC2 START\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');
  },

  async stopInstance(instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });
    const instancesResponse = await ec2Client.stopInstances(params).promise();

    console.log('\nAWS EC2 STOPT\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');
  },
};
