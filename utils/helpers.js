function safeNumber(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }
    return parseFloat(value) || 0;
}

export  {
    safeNumber
};