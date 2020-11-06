/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
require('dotenv').config();

const app = express();

const serverRoutes = require('./components/server/serverRoutes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/v1/api/server', serverRoutes);

app.listen(config.get('port'), () => console.log(`Example app listening on port ${config.get('port')}!`));
