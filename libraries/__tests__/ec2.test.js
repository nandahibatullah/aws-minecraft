const AWS = require('aws-sdk');

const EC2 = require('../ec2');

describe('EC2', () => {
  afterEach(() => AWS.clearAllMocks());
  describe('describeInstance', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance data', async () => {
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve({
            Reservations: [
              {
                Instances: [
                  {
                    State: {
                      Name: 'running',
                    },
                    PublicIpAddress: '127.0.0.1',
                  },
                ],
              },
            ],
          }),
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
        const mockWaitFor = AWS.spyOn('EC2', 'waitFor').mockReturnValue({
          promise: () => Promise.resolve({
            Reservations: [
              {
                Instances: [
                  {
                    State: {
                      Name: 'stopped',
                    },
                    PublicIpAddress: '',
                  },
                ],
              },
            ],
          }),
        });
        const stateString = 'instanceRunning';
        const params = {
          InstanceIds: ['123'],
        };
        const expectedResult = { state: 'stopped', ipAddress: '' };
        const describeInstanceRunning = await EC2.describeInstance(stateString, '123');

        expect(mockWaitFor).toHaveBeenCalledWith('instanceExists', params);
        expect(describeInstanceRunning).toEqual(expectedResult);
      });
    });
  });
});
