const AWS = require('aws-sdk');

const EC2 = require('../ec2');
const mockInstanceRunningResponse = require('./__mocks__/instanceRunningResponse.json');
const mockInstanceStoppedResponse = require('./__mocks__/instanceStoppedResponse.json');
const mockInstanceStatusOkResponse = require('./__mocks__/instanceStatusOkResponse.json');
const mockStartInstanceResponse = require('./__mocks__/startInstanceResponse.json');
const mockStopInstanceResponse = require('./__mocks__/stopInstanceResponse.json');

describe('EC2', () => {
  afterEach(() => AWS.clearAllMocks());
  describe('describeInstance', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance data', async () => {
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve(mockInstanceRunningResponse),
        });
        const stateString = 'instanceRunning';
        const params = {
          InstanceIds: ['123'],
        };
        const expectedResult = {
          state: 'running',
          ipAddress: '127.0.0.1',
        };
        const describeInstanceRunning = await EC2.describeInstance(stateString, '123');

        expect(mockWaitFor).toHaveBeenCalledWith(stateString, params);
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });

    describe('when the instance is stopped', () => {
      it('returns a response with state \'stopped\'', async () => {
        AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve(mockInstanceStoppedResponse),
        });
        const stateString = 'instanceRunning';
        const expectedResult = {
          state: 'stopped',
          ipAddress: '',
        };

        const describeInstanceRunning = await EC2.describeInstance(stateString, '123');
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });
  });

  describe('describeInstanceStatus', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance a status', async () => {
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValueOnce({
          promise: () => Promise.resolve(mockInstanceRunningResponse),
        }).mockReturnValueOnce({
          promise: () => Promise.resolve(mockInstanceStatusOkResponse),
        });
        const stateString = 'instanceStatusOk';
        const params = {
          InstanceIds: ['123'],
        };
        const expectedResult = {
          status: 'ok',
        };
        const describeInstanceRunning = await EC2.describeInstanceStatus(stateString, '123');

        expect(mockWaitFor).toHaveBeenCalledWith(stateString, params);
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });

    describe('when the instance is stopped', () => {
      it('returns a response with status \'stopped\'', async () => {
        AWS.spyOnPromise('EC2', 'waitFor').mockReturnValueOnce({
          promise: () => Promise.resolve(mockInstanceStoppedResponse),
        });

        const stateString = 'instanceStatusOk';
        const expectedResult = {
          status: 'stopped',
        };

        const describeInstanceRunning = await EC2.describeInstanceStatus(stateString, '123');
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });
  });

  describe('startInstance', () => {
    describe('when given a valid instance id', () => {
      it('starts the instance with current state pending', async () => {
        const mockStartInstance = AWS.spyOn('EC2', 'startInstances').mockReturnValue({
          promise: () => Promise.resolve(mockStartInstanceResponse),
        });
        const params = {
          InstanceIds: ['123'],
        };

        await EC2.startInstance('123');

        expect(mockStartInstance).toHaveBeenCalledWith(params);

        const startInstanceResponse = await mockStartInstance().promise();
        expect(startInstanceResponse.StartingInstances[0].CurrentState.Name).toEqual('pending');
        expect(startInstanceResponse.StartingInstances[0].InstanceId)
          .toEqual(params.InstanceIds[0]);
      });
    });
  });

  describe('stopInstance', () => {
    describe('when given a valid instance id', () => {
      it('stops the instance with current state pending', async () => {
        const mockStoppedInstance = AWS.spyOn('EC2', 'stopInstances').mockReturnValue({
          promise: () => Promise.resolve(mockStopInstanceResponse),
        });
        const params = {
          InstanceIds: ['123'],
        };

        await EC2.stopInstance('123');
        expect(mockStoppedInstance).toHaveBeenCalledWith(params);

        const stopInstanceResponse = await mockStoppedInstance().promise();
        expect(stopInstanceResponse.StoppingInstances[0].CurrentState.Name).toEqual('stopping');
        expect(stopInstanceResponse.StoppingInstances[0].InstanceId).toEqual(params.InstanceIds[0]);
      });
    });
  });
});
