const { resolve } = require("path");
const execa = require("execa");

const requestToLambda = (req, requestBody) => {
    return {
        headers: requestBody.headers || {},
        path: "/",
        resource: "/",
        httpMethod: requestBody.httpMethod || "POST",
        body: requestBody.body,
        isBase64Encoded: requestBody.isBase64Encoded || false
    };
};

module.exports = [
    {
        type: "cli-develop-resource",
        component: "@webiny/serverless-function",
        async run({ resource }, context) {
            return;
            // TODO: add CLI arg to disable bundling
            if (resource.build) {
                const { root, script } = resource.build;
                const [command, ...commandParams] = script.split(" ");
                await execa(command, commandParams, {
                    cwd: resolve(context.develop.stack, root),
                    stdio: "inherit",
                    env: process.env
                });
            }
        },
        interpolateReference({ reference, resource }) {
            switch (reference) {
                case "arn":
                case "name":
                    return resource.name;
                default:
                    throw Error(
                        `Unable to interpolate "${reference}" on "${reference.name}" resource.`
                    );
            }
        }
    },
    {
        type: "cli-develop-sdk-handler",
        canHandle({ req }) {
            return req.options.hostname.startsWith("lambda");
        },
        async handle({ req, requestBody }, context) {
            // Extract function name
            const name = req.path.split("/")[3];
            // Create a Lambda event object
            const event = requestToLambda(req, requestBody);
            console.log(`executeFunction`, name, event);
            const res = await context.develop.executeFunction({ name, event }, context);
            console.log("res", res);
            return [200, res];
        }
    }
];
