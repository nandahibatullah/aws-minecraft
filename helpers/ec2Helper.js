/* eslint-disable no-console */
module.exports = class EC2Helper {
  constructor(client) {
    this.ec2Client = client;
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
};
