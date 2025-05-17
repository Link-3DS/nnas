require('dotenv/config');
require('reflect-metadata');
const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const logger = require('./logger');

const conntest = require('./routes/conntest');
const nnas = require('./routes/nnas');

const app = express();

app.use(bodyParser.text({ type: 'application/xml' }));

app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/xml') {
    xml2js.parseString(req.body, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(400).send('Invalid XML');
      }
      req.body = result;
      next();
    });
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set('X-Organization', 'Nintendo');
  next();
});

app.use(conntest);
app.use(nnas);

app.listen(process.env.HTTP_PORT, () => {
  logger.success(`Server is running on port ${process.env.HTTP_PORT}.`);
});