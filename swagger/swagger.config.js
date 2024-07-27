const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

const swaggerPath = path.join(__dirname, 'user_swagger.yaml');
const swaggerSpec = yaml.load(swaggerPath);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
