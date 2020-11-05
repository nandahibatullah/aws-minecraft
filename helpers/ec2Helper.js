module.exports = class EC2Helper {
  constructor(client) {
    const ec2Client = client;
    this.getClient = () => ec2Client;
  }

  async describeInstance(state, instanceID) {
    const params = {
      InstanceIds: [instanceID],
    };
    const instancesResponse = await this.ec2Client.waitFor(state, params).promise();
    const instanceData = instancesResponse.Reservations[0].Instances[0];

    return {
      state: instanceData.State.Name,
      status: instanceData.Status,
      ipAddress: instanceData.PublicIpAddress,
    };
  }
};
