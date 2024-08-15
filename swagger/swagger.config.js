const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

// Swagger 문서 경로 설정
const userSwaggerPath = path.join(__dirname, 'user_swagger.yaml');
const groupChatSwaggerPath = path.join(__dirname, 'group_chat_swagger.yaml');
const joinSwaggerPath = path.join(__dirname, 'join_swagger.yaml');
const blockSwaggerPath = path.join(__dirname, 'block_swagger.yaml');
const notificationSwaggerPath = path.join(__dirname, 'notifications_swagger.yaml');
const personalChatSwaggerPath = path.join(__dirname, 'chat.yaml'); 
const reportSwaggerPath = path.join(__dirname, 'report_swagger.yaml');
const mbtiUpdateSwaggerPath = path.join(__dirname, 'mbti_update_swagger.yaml');
const authSwaggerPath = path.join(__dirname, 'auth_swagger.yaml'); // auth_swagger.yaml 추가

// Swagger 문서 로드
const userSwaggerSpec = yaml.load(userSwaggerPath);
const groupChatSwaggerSpec = yaml.load(groupChatSwaggerPath);
const joinSwaggerSpec = yaml.load(joinSwaggerPath);
const blockSwaggerSpec = yaml.load(blockSwaggerPath);
const notificationSwaggerSpec = yaml.load(notificationSwaggerPath);
const personalChatSwaggerSpec = yaml.load(personalChatSwaggerPath);
const reportSwaggerSpec = yaml.load(reportSwaggerPath);
const mbtiUpdateSwaggerSpec = yaml.load(mbtiUpdateSwaggerPath);
const authSwaggerSpec = yaml.load(authSwaggerPath); // auth_swagger.yaml 로드

// Swagger 문서 통합
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
    ...notificationSwaggerSpec.paths,
    ...reportSwaggerSpec.paths,
    ...personalChatSwaggerSpec.paths,
    ...mbtiUpdateSwaggerSpec.paths,
    ...authSwaggerSpec.paths // 사용자 인증 경로 추가
  },
  components: {
    schemas: {
      ...userSwaggerSpec.components?.schemas,
      ...groupChatSwaggerSpec.components?.schemas,
      ...joinSwaggerSpec.components?.schemas,
      ...blockSwaggerSpec.components?.schemas,
      ...notificationSwaggerSpec.components?.schemas,
      ...reportSwaggerSpec.components?.schemas,
      ...personalChatSwaggerSpec.components?.schemas,
      ...mbtiUpdateSwaggerSpec.components?.schemas 
    }
  }
};

module.exports = {
  swaggerUi,
  swaggerSpec: combinedSpec
};
