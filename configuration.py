class Config:
    # AWS Information
    ec2_region = 'ap-southeast-2'  # Same as environment variable EC2_REGION
    ec2_amis = ['ami-04fcc97b5f6edcd89']
    ec2_keypair = 'aws-minecraft'
    ec2_secgroups = ['minecraft']
    ec2_instancetype = 't3.small'
