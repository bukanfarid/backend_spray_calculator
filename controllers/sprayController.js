import calculate from '../services/calculationService.js'; 

const calculateSpray = (req, res) => {
    try {
        const inputData = req.body;
        const result = calculate.calculateSprayData(inputData);
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
    res.json({ 
        message: 'Spray Calculator API is running!',
        endpoints: {
            'POST /calculate-spray': 'Main calculation endpoint'
        }
    });
};

export default {
    calculateSpray,
    testEndpoint
};