/* eslint-disable no-console */
const config = require('config');

const serverService = require('./serverService');
const reqResponse = require('./serverResponseHandler');

module.exports = {
  startServer: async (req, res) => {
    const body = {};
    const { password } = req.body;
    const serverId = config.get('serverId');
    try {
      if (password === config.get('serverPassword')) {
        const { state, ipAddress } = await serverService.startServer(serverId);

        body.state = state;
        body.ipAddress = ipAddress;

        res.status(200).render('pages/index', {
          body,
          path: req.path,
          errors: req.flash('error'),
        });
      } else {
        req.flash('error', 'Password Incorrect!');
        res.redirect('/');
      }
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
  stopServer: async (req, res) => {
    try {
      res.render();
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
  startMinecraftProcess: async (req, res) => {
    try {
      res.render();
    } catch (error) {
      console.error(error);
      res.status(502).send(reqResponse.errorResponse(502));
    }
  },
};
