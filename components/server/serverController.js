/* eslint-disable no-console */
const config = require('config');

const serverService = require('./serverService');
const reqResponse = require('./serverResponseHandler');

module.exports = {
  startServer: async (req, res) => {
    const { password } = req.body;
    const serverId = config.get('serverId');
    try {
      if (password === config.get('serverPassword')) {
        const serverInformation = await serverService.startServer(serverId);
        const message = 'server sucessessfully started';
        res.status(200).send(reqResponse.sucessResponse(200, message, serverInformation));
      } else {
        res.status(400).send(reqResponse.errorResponse(400));
      }
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
  stopServer: async (req, res) => {
    const { password } = req.body;
    const serverId = config.get('serverId');
    try {
      if (password === config.get('serverPassword')) {
        const serverInformation = await serverService.stopServer(serverId);
        const message = 'server sucessessfully stopped';
        res.status(200).send(reqResponse.sucessResponse(200, message, serverInformation));
      } else {
        res.status(400).send(reqResponse.errorResponse(400));
      }
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
  startMinecraftProcess: async (req, res) => {
    const { password } = req.body;
    const serverId = config.get('serverId');

    try {
      if (password === config.get('serverPassword')) {
        const serverInformation = await serverService.startMinecraftProcess(serverId);
        const message = 'minecraft processess successfully started';
        res.status(200).send(reqResponse.sucessResponse(200, message, serverInformation));
      } else {
        res.status(400).send(reqResponse.errorResponse(400));
      }
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
  serverInformation: async (req, res) => {
    const { password, state } = req.body;
    const serverId = config.get('serverId');

    try {
      if (password === config.get('serverPassword')) {
        const serverInformation = await serverService.getServerInformation(state, serverId);
        const message = 'server information recieved successfully';
        res.status(200).send(reqResponse.sucessResponse(200, message, serverInformation));
      } else {
        res.status(400).send(reqResponse.errorResponse(400));
      }
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
};
