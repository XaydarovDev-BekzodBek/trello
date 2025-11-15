const SwaggerJsDocs = require("swagger-jsdoc");
const SwaggerUi = require("swagger-ui-express");

const SwaggerSpec = SwaggerJsDocs({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express api with Swagger",
      version: "1.0.0",
    },
    basePath: "/api",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },

  apis: ["./src/routes/*.route.js"],
});

const setUpSwagger = (app) => {
  app.use("/api/documentation", SwaggerUi.serve, SwaggerUi.setup(SwaggerSpec));
};

module.exports = setUpSwagger;
