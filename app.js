// Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sprayController = require('./controllers/sprayController.js');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ⭐ CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment or use defaults
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:8080',
          'http://127.0.0.1:3001'
        ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware untuk parsing JSON
app.use(express.json()); 

app.post('/calculate-spray', sprayController.calculateSpray);
app.get('/test', sprayController.testEndpoint);
app.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    corsEnabled: true
  });
});

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

module.exports = app;