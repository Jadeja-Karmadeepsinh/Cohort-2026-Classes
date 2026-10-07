export function calculator({operation, num1, num2}) {
    if(typeof num1 !== "number" || typeof num2 !== "number") {
        return "Both num1 and num2 should be numbers";
    }

    switch(operation) {
        case "add":
            return num1 + num2;
        
        case "subtract":
            return num1 - num2;

        case "multiply":
            return num1 * num2;

        case "divide": 
            if(num2 === 0) {
                return "Can not divide by zero";
            }
            return num1 / num2;

        default: 
            return "Invalid operation. User add, subtract, multiply, divide";
    }
}

export const calculateTool = {
    type: "function",
    function: {
        name: "calculator",
        description: "A simple calculator function that performs basic arithmetic operations.",
        parameters: {
            type: "object",
            properties: {
                operation: { 
                    type: "string",
                    enum: ["add", "subtract", "multiply", "divide"],
                },
                num1: {
                    type: "number",
                },  
                num2: {
                    type: "number",
                },
            },
            required: ["operation", "num1", "num2"],
        },
    },
};