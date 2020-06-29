export const handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello!" }),
        headers: {
            "Content-Type": "application/json"
        },
        isBase64Encoded: false
    };
};
