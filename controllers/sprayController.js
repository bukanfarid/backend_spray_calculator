import { calculateSprayData } from '../services/calculationService.js';

const calculateSpray = (req, res) => {
    try {
        const inputData = req.body;
        const result = calculateSprayData(inputData);
        res.json(result);
    } catch (error) {
        console.error('Error in calculation:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}; 

const testEndpoint = (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
        success: true,
        data: {
            appName: 'Spray Calculator API',
            version: '1.0.0',
            status: 'running',
            uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
            memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB used`,
            timestamp: new Date().toISOString(),
            endpoints: {
                'GET /info': 'API information',
                'GET /test': 'Health check',
                'POST /calculate-spray': 'Main calculation'
            }
        }
    });
};

export default {
    calculateSpray,
    testEndpoint
};