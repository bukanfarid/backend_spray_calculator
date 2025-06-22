import {safeNumber} from '../utils/helpers.js';

// Fungsi untuk menghitung area sprayed
function calculateAreaSprayed(hectares, averageSwath, averageRowSpace) {
    if (averageRowSpace === 0) return hectares; // hindari pembagian dengan 0
    return hectares * averageSwath / averageRowSpace;
}

// Fungsi untuk menghitung total water untuk satu block
function calculateTotalWater(hectares, waterPerHa) {
    return hectares * waterPerHa;
}

// Fungsi untuk menghitung number of tanks required
function calculateTanksRequired(totalWater, tankCapacity) {
    if (tankCapacity === 0) return 0; // hindari pembagian dengan 0
    return totalWater / tankCapacity;
}

// Fungsi untuk menghitung product usage berdasarkan unit type
function calculateProductUsage(rate, totalAreaSprayed, totalWater, cf, unit) {
    cf = cf || 1; // default cf = 1
    
    if (unit.includes('/ha')) {
        // Untuk unit per hectare (L/ha, kg/ha, g/ha, dll)
        return cf * rate * totalAreaSprayed;
    } else if (unit.includes('/100L')) {
        // Untuk unit per 100L (kg/100L, g/100L, mL/100L)
        return cf * rate * (totalWater / 100);
    } else if (unit.includes('/L')) {
        // Untuk unit per L (g/L, mL/L, kg/L)
        return cf * rate * totalWater;
    } else {
        // Default fallback
        return cf * rate * totalAreaSprayed;
    }
}

// Main calculation function
function calculateSprayData(inputData) {
    // Ambil data dengan safe defaults
    const blocks = Array.isArray(inputData.blocks) ? inputData.blocks : [];
    const products = Array.isArray(inputData.products) ?  inputData.products : [];
    const averageRowSpace = safeNumber(inputData.average_row_space);
    const averageSwath = safeNumber(inputData.average_swath);
    const waterSprayedInput = safeNumber(inputData.water_sprayed_input);
    const tankCapacity = safeNumber(inputData.tank_capacity);
    const adjustment = safeNumber(inputData.adjustment);  

    // Just random keys, not processed yet saved
    const additionalKeys = Object.keys(inputData).filter(key => !['blocks', 'products', 'average_row_space', 'average_swath', 'water_sprayed_input', 'water_sprayed_input_unit', 'tank_capacity', 'adjustment', 'application_method'].includes(key));

    // Hitung data untuk setiap block
    const calculatedBlocks = blocks.map(block => {
        const hectares = safeNumber(block.hectares);
        const hectaresSpraied = calculateAreaSprayed(hectares, averageSwath, averageRowSpace);
        const totalWater = calculateTotalWater(hectares, waterSprayedInput);
        const numberTankRequired = calculateTanksRequired(totalWater, tankCapacity);
        
        // Perhitungan dengan adjustment
        const adjustedTotalWater = totalWater * (1 + adjustment / 100);
        const adjustedNumberTankRequired = calculateTanksRequired(adjustedTotalWater, tankCapacity);
        
        return {
            block_id: block.block_id,
            hectares: hectares,
            hectares_sprayed: parseFloat(hectaresSpraied.toFixed(2)),
            total_water: parseFloat(totalWater.toFixed(0)),
            number_tank_required: parseFloat(numberTankRequired.toFixed(2)),
            adjusted: {
                total_water: parseFloat(adjustedTotalWater.toFixed(0)),
                number_tank_required: parseFloat(adjustedNumberTankRequired.toFixed(2))
            }
        };
    });
    
    // Hitung total untuk semua blocks
    const totalArea = calculatedBlocks.reduce((sum, block) => sum + block.hectares, 0);
    const totalAreaSprayed = calculatedBlocks.reduce((sum, block) => sum + block.hectares_sprayed, 0);
    const totalWater = totalArea * waterSprayedInput;
    const numberTankRequired = calculateTanksRequired(totalWater, tankCapacity);
    
    // Adjusted totals
    const adjustedTotalWater = totalWater * (1 + adjustment / 100);
    const adjustedNumberTankRequired = calculateTanksRequired(adjustedTotalWater, tankCapacity);
    
    // Hitung water per 100m
    const waterSprayedPer100m = averageRowSpace === 0 ? 0 : (averageRowSpace / 100) * waterSprayedInput;
    
    // Hitung products
    const calculatedProducts = products.map(product => {
        const rate = safeNumber(product.rate);
        const cf = safeNumber(product.cf) || 1;
        const unit = product.unit || '';
        
        // Hitung total usage
        let totalUsedNumeric = calculateProductUsage(rate, totalAreaSprayed, totalWater, cf, unit);
        
        // Convert ke unit yang benar (kg atau L berdasarkan base_unit)
        let displayUnit = product.base_unit === 'kg' ? 'kg' : 'L';
        if (unit.includes('g/') && product.base_unit === 'kg') {
            totalUsedNumeric = totalUsedNumeric / 1000; // convert g ke kg
        } else if (unit.includes('mL/') && product.base_unit === 'L') {
            totalUsedNumeric = totalUsedNumeric / 1000; // convert mL ke L
        }
        
        // Total per hectare
        const totalUsedPerHa = totalAreaSprayed === 0 ? 0 : totalUsedNumeric / totalAreaSprayed;
        
        // Adjusted calculations
        const adjustedTotalUsed = totalUsedNumeric * (1 + adjustment / 100);
        const adjustedTotalUsedPerHa = totalUsedPerHa * (1 + adjustment / 100);
        
        // Calculate per tank usage
        const fullTanks = Math.floor(adjustedNumberTankRequired);
        const partTank = adjustedNumberTankRequired - fullTanks;
        
        const totalUsedFullTank = adjustedTotalUsed / adjustedNumberTankRequired;
        const totalUsedPartTank = partTank === 0 ? 0 : adjustedTotalUsed * (partTank / adjustedNumberTankRequired);
        
        return {
            spray_product_id: product.spray_product_id,
            product_id: product.product_id,
            base_unit: product.base_unit,
            base_unit_description: product.base_unit_description,
            rate: rate,
            unit: unit,
            unit_decription: product.unit_decription,
            cf: cf,
            total_used: {
                numeric: parseFloat(totalUsedNumeric.toFixed(2)),
                unit: displayUnit
            },
            total_used_per_ha: {
                numeric: parseFloat(totalUsedPerHa.toFixed(2)),
                unit: displayUnit
            },
            adjusted: {
                total_used: {
                    numeric: parseFloat(adjustedTotalUsed.toFixed(2)),
                    unit: displayUnit
                },
                total_used_per_ha: {
                    numeric: parseFloat(adjustedTotalUsedPerHa.toFixed(2)),
                    unit: displayUnit
                },
                total_used_full_tank: {
                    numeric: parseFloat(totalUsedFullTank.toFixed(2)),
                    unit: displayUnit
                },
                total_used_part_tank: {
                    numeric: parseFloat(totalUsedPartTank.toFixed(2)),
                    unit: displayUnit
                }
            }
        };
    });
    
    // Siapkan output
    let objectToReturn =  {
        blocks: calculatedBlocks,
        application_method: inputData.application_method || "Foliar",
        average_row_space: averageRowSpace,
        average_swath: averageSwath,
        water_sprayed_input: waterSprayedInput,
        water_sprayed_input_unit: inputData.water_sprayed_input_unit || "Per Hectare",
        tank_capacity: tankCapacity,
        adjustment: adjustment,
        total_area: parseFloat(totalArea.toFixed(2)),
        total_area_sprayed: parseFloat(totalAreaSprayed.toFixed(2)),
        water_sprayed_per_ha: waterSprayedInput,
        water_sprayed_per_100m: parseFloat(waterSprayedPer100m.toFixed(0)),
        total_water: parseFloat(totalWater.toFixed(0)),
        number_tank_required: parseFloat(numberTankRequired.toFixed(2)),
        number_tank_required_full: Math.floor(numberTankRequired),
        number_tank_required_part: parseFloat((numberTankRequired - Math.floor(numberTankRequired)).toFixed(2)),
        adjusted: {
            total_water: parseFloat(adjustedTotalWater.toFixed(0)),
            number_tank_required: parseFloat(adjustedNumberTankRequired.toFixed(2)),
            number_tank_required_full: Math.floor(adjustedNumberTankRequired),
            number_tank_required_part: parseFloat((adjustedNumberTankRequired - Math.floor(adjustedNumberTankRequired)).toFixed(2))
        },
        products: calculatedProducts
    };

    // Add additional keys if exists
    if (additionalKeys.length > 0) {
        additionalKeys.forEach(key => {
            objectToReturn[key] = inputData[key];
        });
    }

    return objectToReturn;
}

export {
    calculateSprayData 
};
 