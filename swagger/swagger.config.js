const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

const userSwaggerPath = path.join(__dirname, 'user_swagger.yaml');
const groupChatSwaggerPath = path.join(__dirname, 'group_chat_swagger.yaml');

const userSwaggerSpec = yaml.load(userSwaggerPath);
const groupChatSwaggerSpec = yaml.load(groupChatSwaggerPath);

const combinedSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Combined API',
    version: '1.0.0',
    description: 'Combined User and Group Chat API'
  },
  paths: {
    ...userSwaggerSpec.paths,
    ...groupChatSwaggerSpec.paths
  },
  components: {
    schemas: {
      ...userSwaggerSpec.components?.schemas,
      ...groupChatSwaggerSpec.components?.schemas
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerSpec: combinedSpec
};