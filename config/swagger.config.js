const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATTI API',
      version: '1.0.0',
      description: 'ATTI API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // API 문서화가 필요한 파일 경로
});

module.exports = {
  swaggerUi,
  swaggerSpec,
};
