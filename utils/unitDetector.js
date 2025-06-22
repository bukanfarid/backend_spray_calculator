/**
 * Detects if a unit contains special agricultural units that are not yet implemented
 * @param {string} unit - Unit string to check (e.g., "kg/ha", "dispensers/ha", "g/vine")
 * @returns {boolean} - True if unit contains special elements
 */
function isSpecialUnit(unit) {
    if (!unit || typeof unit !== 'string') return false;
    
    // Convert to lowercase for case-insensitive matching
    const unitLower = unit.toLowerCase();
    
    // Special unit keywords that indicate unsupported units
    const specialKeywords = [
        // Special objects/devices
        'dispenser', 'dispensers',
        'pellet', 'pellets', 
        'tablet', 'tablets',
        'sachet', 'sachets',
        'brush', 'brushes',
        'implant', 'dowel',
        'trap', 'traps',
        
        // Plant/cultivation specific
        'vine', 'vines',
        'tree', 'trees', 
        'plant', 'plants',
        'row', 'rows',
        'nest', 'nests',
        'hole', 'holes',
        'plot', 'plots',
        
        // Special measurements
        'drop', 'drops',
        'piece', 'pieces',
        'unit', 'units',
        'item', 'items'
    ];
    
    // Check if unit contains any special keywords
    return specialKeywords.some(keyword => unitLower.includes(keyword));
}

/**
 * Determines unit category for calculation method
 * @param {string} unit - Unit string
 * @returns {object} - Unit analysis result
 */
function analyzeUnit(unit) {
    if (!unit || typeof unit !== 'string') {
        return {
            isValid: false,
            isSpecial: false,
            category: null,
            message: 'Invalid unit format'
        };
    }
    
    // Check if it's a special unit first
    if (isSpecialUnit(unit)) {
        return {
            isValid: true,
            isSpecial: true,
            category: 'special',
            message: `Special unit '${unit}' is not yet implemented`,
            supportStatus: 'not_implemented'
        };
    }
    
    // Check standard units (existing implementation)
    if (unit.includes('/ha')) {
        return {
            isValid: true,
            isSpecial: false,
            category: 'per_hectare',
            message: 'Standard per hectare unit',
            supportStatus: 'implemented'
        };
    } else if (unit.includes('/100L')) {
        return {
            isValid: true,
            isSpecial: false,
            category: 'per_100L',
            message: 'Standard per 100L unit',
            supportStatus: 'implemented'
        };
    } else if (unit.includes('/L')) {
        return {
            isValid: true,
            isSpecial: false,
            category: 'per_liter',
            message: 'Standard per liter unit',
            supportStatus: 'implemented'
        };
    } else {
        return {
            isValid: false,
            isSpecial: false,
            category: 'unknown',
            message: `Unknown unit format: '${unit}'`,
            supportStatus: 'unknown'
        };
    }
}

module.exports = {
    isSpecialUnit,
    analyzeUnit
};