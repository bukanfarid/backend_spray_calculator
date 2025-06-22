// Import dependencies
import express from 'express';
import dotenv from 'dotenv';
import sprayController from './controllers/sprayController.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json()); 

app.post('/calculate-spray', sprayController.calculateSpray);
app.get('/test', sprayController.testEndpoint);
app.get('*', (req, res) => {
    res.status(404).json({  
        error: 'Not Found',
        message: 'The requested endpoint does not exist.'
    });
});

// Start server
app.listen(port, () => {
    console.log(`${process.env.APP_NAME || 'API'} running at http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API info: http://localhost:${port}/info`);
});

export default app;