const AWS = require('aws-sdk');
const EC2 = require('../ec2');

describe('EC2', () => {
  afterEach(() => AWS.clearAllMocks());

  describe('describeInstance', () => {
    describe('when the instance is running', () => {
      it('returns a response with instance data', async () => {
        AWS.spyOn('EC2', 'waitFor').mockReturnValue({
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

        const describeInstanceRunning = await EC2.describeInstance('instanceRunning', '123');
        expect(describeInstanceRunning).toEqual({ state: 'running', ipAddress: '127.0.0.1' });
      });
    });
  });
});
