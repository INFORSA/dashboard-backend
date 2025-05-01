const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "API Documentation",
      description: "API Documentation INFORSA UNMUL",
      contact: {
        name: "Developer"
      },
      servers: ["https://api.inforsa-unmul.org"]
    }
  },
  apis: ["./models/*.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
