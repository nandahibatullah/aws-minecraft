const AWS = require('aws-sdk');

const EC2 = require('../ec2');
const instanceRunningResponse = require('./__mocks__/instanceRunningResponse.json');
const instanceStoppedResponse = require('./__mocks__/instanceStoppedResponse.json');
const instanceStatusOkResponse = require('./__mocks__/instanceStatusOkResponse.json');

describe('EC2', () => {
  afterEach(() => AWS.clearAllMocks());
  describe('describeInstance', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance data', async () => {
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve(instanceRunningResponse),
        });
        const stateString = 'instanceRunning';
        const params = {
          InstanceIds: ['123'],
        };
        const expectedResult = { state: 'running', ipAddress: '127.0.0.1' };
        const describeInstanceRunning = await EC2.describeInstance(stateString, '123');

        expect(mockWaitFor).toHaveBeenCalledWith(stateString, params);
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });

    describe('when the instance is stopped', () => {
      it('returns a response with state \'stopped\'', async () => {
        AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve(instanceStoppedResponse),
        });
        const stateString = 'instanceRunning';
        const expectedResult = { state: 'stopped', ipAddress: '' };

        const describeInstanceRunning = await EC2.describeInstance(stateString, '123');
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });
  });

  describe('describeInstanceStatus', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance a status', async () => {
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValueOnce({
          promise: () => Promise.resolve(instanceRunningResponse),
        }).mockReturnValueOnce({
          promise: () => Promise.resolve(instanceStatusOkResponse),
        });
        const stateString = 'instanceStatusOk';
        const params = {
          InstanceIds: ['123'],
        };
        const expectedResult = { status: 'ok' };
        const describeInstanceRunning = await EC2.describeInstanceStatus(stateString, '123');

        expect(mockWaitFor).toHaveBeenCalledWith(stateString, params);
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });

    describe('when the instance is stopped', () => {
      it('returns a response with status \'stopped\'', async () => {
        AWS.spyOn('EC2', 'waitFor').mockReturnValueOnce({
          promise: () => Promise.resolve(instanceStoppedResponse),
        });

        const stateString = 'instanceStatusOk';
        const expectedResult = { status: 'stopped' };

        const describeInstanceRunning = await EC2.describeInstanceStatus(stateString, '123');
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });
  });
});
