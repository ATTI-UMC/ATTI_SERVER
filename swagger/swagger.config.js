const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

const userSwaggerPath = path.join(__dirname, 'user_swagger.yaml');
const groupChatSwaggerPath = path.join(__dirname, 'group_chat_swagger.yaml');
const joinSwaggerPath = path.join(__dirname, 'join_swagger.yaml');
const blockSwaggerPath=path.join(__dirname, 'block_swagger.yaml');
const notificationSwaggerPath=path.join(__dirname,'notifications_swagger.yaml');

const userSwaggerSpec = yaml.load(userSwaggerPath);
const groupChatSwaggerSpec = yaml.load(groupChatSwaggerPath);
const joinSwaggerSpec = yaml.load(joinSwaggerPath);
const blockSwaggerSpec=yaml.load(blockSwaggerPath);
const notificationSwaggerSpec=yaml.load(notificationSwaggerPath);

const combinedSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Combined API',
    version: '1.0.0',
    description: 'Combined User and Group Chat API'
  },
  paths: {
    ...userSwaggerSpec.paths,
    ...groupChatSwaggerSpec.paths,
    ...joinSwaggerSpec.paths,
    ...blockSwaggerSpec.paths,
    ...notificationSwaggerSpec.paths
    ...joinSwaggerSpec.paths
  },
  components: {
    schemas: {
      ...userSwaggerSpec.components?.schemas,
      ...groupChatSwaggerSpec.components?.schemas,
      ...joinSwaggerSpec.components?.schemas,
      ...blockSwaggerSpec.components?.schemas,
      ...notificationSwaggerSpec.components?.schemas
      ...joinSwaggerSpec.components?.schemas
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerSpec: combinedSpec
};
};
