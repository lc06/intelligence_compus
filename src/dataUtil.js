function extractValues(input,key){
    let result = [];

    if (input) {
        let keyValue = input[key];
        if (keyValue !== undefined) {
            result.push(keyValue);
        }

        for (const value of Object.values(input)) {
            if (typeof value === 'object') {
                result = result.concat(extractValues(value, key));
            } else if (typeof value === 'array') {
                for (const item of value) {
                    result = result.concat(extractValues(item, key));
                }
            }
        }
    }
    return result;  
}

export { extractValues } ;