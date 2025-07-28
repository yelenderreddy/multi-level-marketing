const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3001, () => {
  console.log('Swagger UI running at http://localhost:3001/api-docs');
});
