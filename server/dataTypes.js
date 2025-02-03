/*
Data types must correspond with coder methods ie:
setString / getString -> "String"
*/

function getDataType(value) {
    if(value === null){
        return "Null";
    }
    if(value === undefined){
        return "Undefined";
    }
	if(typeof value === "string"){
        return "String"
    }
    if(typeof value === "boolean"){
        return "Boolean"
    }
    if(Number.isNaN(value) === true){
        return "NaN"
    }
    if(Number.isFinite(value) === false){
        return "Infinity"
    }

    // Check for integers
    if (Number.isInteger(value)) {
        if (value >= 0) {
            if (value <= 255) return 'Uint8';
            if (value <= 65535) return 'Uint16';
            if (value <= 4294967295) return 'Uint32';
            return 'BigUint64';
        } else {
            if (value >= -128 && value <= 127) return 'Int8';
            if (value >= -32768 && value <= 32767) return 'Int16';
            if (value >= -2147483648 && value <= 2147483647) return 'Int32';
            return 'BigInt64';
        }
    }

    // TODO: Figure out how to detect when I should use float32
    // I want to maintain a good balance between size and percision
    // Ideally we would find some sort of cut off on when to swtich that allows for 5 deciamls of percision
    // Perhaps Im missing something but I havent been able to find help online
    // TODO: Real world impact is yet to be tested, a large game is needed
    /*if (Math.abs(value) <= 3.4e38) {
        return 'Float32';
    }*/
    return 'Float64';
}

const dataTypeToId = {
	"DataCache": 0,
	"String": 1,
    "Boolean": 2,
    "NaN": 3,
    "Null": 4,
    "Undefined": 5,
    "Infinity": 6,
	"Uint8": 7,
	"Int8": 8,
	"Uint16": 9,
	"Int16": 10,
	"Uint32": 11,
	"Int32": 12,
	"Float32": 13,
	"BigUint64": 14,
	"BigInt64": 15,
	"Float64": 16,
}
let idToDataType = Object.fromEntries(Object.entries(dataTypeToId).map(([k, v]) => [v, k]))

export {getDataType, idToDataType, dataTypeToId}