// Import dependencies
import express, { json } from 'express';
import sprayController from './controllers/sprayController.js';

const app = express();
const port = 3000;

// Middleware untuk parsing JSON
app.use(json()); 

app.post('/calculate-spray', sprayController.calculateSpray);
app.get('/test', sprayController.testEndpoint);

// Start server
app.listen(port, () => {
    console.log(`Spray Calculator API running at http://localhost:${port}`);
    console.log(`Test endpoint: http://localhost:${port}/test`);
});

export default app;