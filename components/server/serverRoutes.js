const router = require('express').Router();
const serverController = require('./serverController');

router.route('/start')
  .post(
    serverController.startServer,
  );

router.route('/stop')
  .post(
    serverController.stopServer,
  );

router.route('/minecraftprocess')
  .post(
    serverController.startMinecraftProcess,
  );

router.route('/serverInformation')
  .get(
    serverController.serverInformation,
  );

module.exports = router;
