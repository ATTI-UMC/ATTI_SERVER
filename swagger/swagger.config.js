const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATTI API',
      version: '1.0.0',
      description: 'ATTI API Documentation',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid' // Express 세션 쿠키 이름
        }
      }
    },
    security: [
      {
        cookieAuth: []
      },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../models/*.js'),
  ],
});

console.log('Swagger spec:', JSON.stringify(swaggerSpec, null, 2));

module.exports = {
  swaggerUi,
  swaggerSpec,
};