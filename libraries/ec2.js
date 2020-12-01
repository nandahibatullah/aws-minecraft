/* eslint-disable no-console */
const AWS = require('aws-sdk');
const config = require('config');

const isInstanceStopped = async (ec2Client, params) => {
  const response = await ec2Client.waitFor('instanceExists', params).promise();
  const state = response.Reservations[0].Instances[0].State.Name;

  if (state === 'stopped') {
    return true;
  }

  return false;
};

module.exports = {
  async describeInstance(stateString, instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });

    let state = '';
    let ipAddress = '';

    if (await isInstanceStopped(ec2Client, params)) {
      state = 'stopped';
    } else {
      const instancesResponse = await ec2Client.waitFor(stateString, params).promise();
      const instanceData = instancesResponse.Reservations[0].Instances[0];

      console.log('\nSERVER INSTANCES\n');
      console.log(`${JSON.stringify(instancesResponse)}`);
      console.log('\n');

      state = instanceData.State.Name;
      ipAddress = instanceData.PublicIpAddress;
    }

    return {
      state,
      ipAddress,
    };
  },

  async describeInstanceStatus(stateString, instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const ec2Client = new AWS.EC2({
      region: config.get('serverRegion'),
    });

    let status = '';

    if (await isInstanceStopped(ec2Client, params)) {
      status = 'stopped';
    } else {
      const instanceStatusesResponse = await ec2Client.waitFor(stateString, params).promise();
      const instanceStatusData = instanceStatusesResponse.InstanceStatuses[0];

      console.log('\nSERVER INSTANCES\n');
      console.log(`${JSON.stringify(instanceStatusData)}`);
      console.log('\n');

      status = instanceStatusData.InstanceStatus.Status;
    }

    return {
      status,
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
