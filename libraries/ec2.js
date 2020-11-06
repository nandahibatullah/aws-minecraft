/* eslint-disable no-console */
const AWS = require('aws-sdk');
const config = require('config');

const EC2Client = new AWS.EC2({
  region: config.get('serverRegion'),
});

module.exports = class EC2 {
  constructor() {
    this.ec2Client = EC2Client;
    this.getClient = () => this.ec2Client;
  }

  async describeInstance(state, instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const instancesResponse = await this.ec2Client.waitFor(state, params).promise();
    const instanceData = instancesResponse.Reservations[0].Instances[0];

    console.log('\nSERVER INSTANCES\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');

    return {
      state: instanceData.State.Name,
      status: instanceData.Status,
      ipAddress: instanceData.PublicIpAddress,
    };
  }

  async startInstance(instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const instancesResponse = await this.ec2Client.startInstances(params).promise();

    console.log('\nAWS EC2 START\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');
  }

  async stopInstance(instanceId) {
    const params = {
      InstanceIds: [instanceId],
    };
    const instancesResponse = await this.ec2Client.stopInstances(params).promise();

    console.log('\nAWS EC2 STOPT\n');
    console.log(`${JSON.stringify(instancesResponse)}`);
    console.log('\n');
  }
};
