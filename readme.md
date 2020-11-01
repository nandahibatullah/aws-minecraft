# AWS Minecraft
Launches an AWS EC2 Instance to host a Minecraft server upon request from users through the Node.js + express web app.

## Cost
For up to 20 players you can expect $0.026NZD per hour the server runs. This makes it pretty cheap to run, and you can cut costs down
by remembering to shut off the instance throught the web app when no one is on. (auto-shutdown coming soon).

## Features
This server uses Spigot on Minecraft 1.16.3. The only plugin installed by default is [eBackup](https://www.spigotmc.org/resources/ebackup-simple-and-reliable-backups-for-your-server-supports-ftp-sftp.69917/).
By default on the AMI, eBackup is configured to backup daily at 4am and only keep one backup at a time. This was to reduce the storage used keeping all these backups on the instance (they are like 280mb).
Of course you can configure this to however you like inside `/plugins/eBackup/config.yml`. Backups are found zipped inside `/plugins/eBackup/backups`. Head over to the forum page for more info.

## Credits
This was originally a fork of trevor-laher's [OnDemandMinecraft](https://github.com/trevor-laher/OnDemandMinecraft), but I rewrote the application in Node.js (preference and easily extendable for me) and simplified the setup process via a public AMI. Thanks to Trevor for doing the bulk of the original work.

# Prerequisites
- Install [Node.js 12.^](https://nodejs.org/dist/latest-v12.x/)
- Install [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- Install and setup the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
- run `yarn install`

# Setup

## Web Application Setup

In this step the project will get linked to Heroku's free hosting. This part of the application provides a rudimentary UI and Web URL for users to start the server. Before we deploy the webapp, we will configure it with information about the AWS instance in the next section.

 1. Create or have access to a Heroku account.
 2. In the command line for the directory of this project, type:
	 <code>heroku create YourProjectNameHere</code>

 Now the webapp should be visible in the Heroku dashboard, but it is not deployed yet.

## AWS Setup
This step will properly configure your AWS account so that an instance can be created via the createEC2Instance.js script. We will also set configuration variables for the heroku web app so that it knows how to access the instance.

 1. Create or access an **AWS Account**. Under the **User Dropdown** in the **Toolbar**, select **Security Credentials**, then **Access Keys**, and finally **Create New Access Key**. Download this file, open it, and make note of the values of **AWSAccessKeyId** and **AWSSecretKey**. Later, we will supply these to the instance creation script. For now, we need to allow the heroku app to access them by setting them as configuration variables.

	<code>
	heroku config:set AWS_ACCESS_KEY_ID=Your-access-key-here
	</code>
	<code>
	heroku config:set AWS_SECRET_ACCESS_KEY=Your-secret-key-here
	</code>

 3. Navigate to the **EC2 Dashboard** under the **Services Dropdown** and select **Security Groups** in the sidebar. Select **Create Security Group**, input **minecraft** for the **Security group name**. Create **Inbound Rules** for the following:
	 - Type: **SSH** Protocol: **TCP** Port Range: **22** Source: **Anywhere**
	 - Type: **Custom TCP Rule** Protocol: **TCP** Port Range: **25565** Source: **Anywhere**
	 - Type: **Custom UDP Rule** Protocol: **UDP** Port Range: **25565** Source: **Anywhere**
	 
	 In **createEC2Instance.js** in the root directory, set **SECURITY_GROUPS** to the name of the security group.
	 
	 <code>SECURITY_GROUPS = ['YourGroupNameHere']</code>

3. Under the **EC2 Dashboard** navigate to **Key Pairs** in the sidebar. Select **Create Key Pair**, provide a name and create. Move the file that is downloaded into the root directory of the project (or somewhere else safe) so that you can use it to SSH into the instance later. In **createEC2Instance.js** in the root directory, set **KEYPAIR** to the name entered. Also configure the heroku webapp with the contents of the key file.

	Inside **createEC2Instance.js**: <code>KEYPAIR = 'YourKeyPairName'</code>
	
	To configure heroku, it is easiest to copy-paste the contents of the file via the [heroku dashboard](https://dashboard.heroku.com). Select your app, go to **Settings**, scroll down to **Config Vars**, and add a new one with the name `SSH_KEY` and the value as the contents of the private key file you downloaded.

4. This step is concerned with creating the AWS instance. View [https://docs.aws.amazon.com/general/latest/gr/rande.html](https://docs.aws.amazon.com/general/latest/gr/rande.html) (Or google AWS Regions), and copy the **Region** column for the **Region Name** of where you wish to host your server. In **createEC2Instance.js** of the root directory, set the **EC2_REGION** variable to the copied value. Also configure the heroku app.

	Inside **createEC2Instance.js**: <code>EC2_REGION = "Your-Region-Here"</code>

	On the command line: <code>heroku config:set EC2_REGION=Your-Region-Here</code>

5. Navigate to [https://aws.amazon.com/ec2/instance-types/](https://aws.amazon.com/ec2/instance-types/) and select one of the T3 types (with the memory and CPU you desire, I recommend 10 players/GB). Copy the value in the **Model** column. I've configured mine to use **t3.small**. In **createEC2Instance.js** of the root directory, set the **EC2_INSTANCE_TYPE** variable to the copied value.

	<code>EC2_INSTANCE_TYPE = 't3.yourSizeHere'</code>

6. Then we must select an image for the instance to boot. I've prepared an AMI with everything you need to get going. It has the `spigot.jar` server file and the `./start.sh` script to start the Minecraft Server. In **createEC2Instance.js** of the root directory, set the **AMI_ID** variable to the copied value.

	<code>AMI_ID = 'ami-YourImageIdHere'</code>

7. At this point you should have the necessary configuration to create a new instance through the **createEC2Instance.js** script in the **root** folder. Open a command line here, and execute:

	<code>yarn run createEC2Instance</code>

	Copy the **Instance ID** that is output into the terminal. Tell the heroku web app that this is your instance id.

	<code>heroku config:set INSTANCE_ID=i-yourInstanceIdHere</code>


## Web Application Deployment

Now we've got the ec2 instance and configured the web app configuration variables, we can now deploy the web app.

Start off by setting the **SERVER_PASSWORD** for performing actions to manage the server. Set the **SERVER_PASSWORD** config variable to the password of your choosing.

<code>heroku config:set SERVER_PASSWORD="YourPasswordHere"</code>
 
1. Once this new project has been created, it is time to push the project to Heroku. <code>git push heroku master</code>
2. The URL to your hosted site should be: YourProjectNameHere.herokuapp.com
3. Access your site and launch/access your server!

## AWS Instance Configuration
There isn't much else you need to do to be able to start the server and play at this point. Feel free to mess around with the `server.properties` file for your Minecraft Server via SSH, or use an FTP client to transfer files etc as you see fit for your server.

Stop the server through AWS Console, or login to the web app using the **SERVER_PASSWORD** and press `Start Server` to get to the server IP screen. Here you can stop the server by logging in to the web app using the **SERVER_PASSWORD** and pressing `Stop Server`.

# USAGE
Once everything is setup, you can start / stop the server using the heroku web app you deployed.

You can set the memory allocation for the Minecraft Server using

<code>heroku config:set MEMORY_ALLOCATION=NUMBER_OF_GB</code>

Where NUMBER_OF_GB is the number of gigabytes of ram you want the Minecraft server to be allocated.

# Additional Remarks
## Server Maintenance
Maintaining the server is fairly straightforward and is done primarily through an FTP client like FileZilla. Updating the server file can be done by downloading the new server file, renaming it to **spigot.jar** and replacing the old file on the server.
