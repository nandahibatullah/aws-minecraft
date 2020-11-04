/* eslint-disable no-console */
// code taken from aws-sdk developer guide.
const AWS = require('aws-sdk');

// INSERT VALUES HERE
const AMI_ID = '';
const EC2_REGION = '';
const EC2_INSTANCE_TYPE = '';
const KEY_PAIR = '';
const SECURITY_GROUPS = [''];

AWS.config.update({ region: EC2_REGION });

const instanceParams = {
  ImageId: AMI_ID,
  InstanceType: EC2_INSTANCE_TYPE,
  KeyName: KEY_PAIR,
  MinCount: 1,
  MaxCount: 1,
  SecurityGroups: SECURITY_GROUPS,
};

// Create a promise on an EC2 service object
const instancePromise = new AWS.EC2({ apiVersion: '2016-11-15' }).runInstances(instanceParams).promise();

// Handle promise's fulfilled/rejected states
instancePromise.then(
  (data) => {
    console.log(data);
    const instanceId = data.Instances[0].InstanceId;
    console.log('Created instance', instanceId);
    // Add tags to the instance
    const tagParams = {
      Resources: [instanceId],
      Tags: [
        {
          Key: 'Name',
          Value: 'AWS Minecraft',
        },
      ],
    };
    // Create a promise on an EC2 service object
    const tagPromise = new AWS.EC2({ apiVersion: '2016-11-15' }).createTags(tagParams).promise();
    // Handle promise's fulfilled/rejected states
    tagPromise.then(
      () => {
        console.log('Instance tagged');
      },
    ).catch(
      (err) => {
        console.error(err, err.stack);
      },
    );
  },
).catch(
  (err) => {
    console.error(err, err.stack);
  },
);
