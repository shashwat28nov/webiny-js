const { join, resolve } = require("path");
const fs = require("fs");
const { blue, green } = require("chalk");
const indentString = require("indent-string");

const indent = num => {
    const original = console.log;
    console.log = (first, ...args) => {
        if (typeof first === "string") {
            if (first.includes("QueryPlan")) {
                return;
            }
            original(indentString(first, num), ...args);
        } else {
            original(first, ...args);
        }
    };
    return () => (console.log = original);
};

module.exports.executeFunction = async ({ name, event }, context) => {
    console.log(`> Executing function ${blue(name)}`);
    const setEnvironmentVariables = map => {
        Object.keys(map).forEach(key => {
            let value = map[key];
            if (typeof value !== "string") {
                return;
            }

            const matches = value.match(/\${(\w*:?[\w\d.-]+)}/g);
            if (matches) {
                const match = matches[0];
                const [name, ...props] = match.substring(2, match.length - 1).split(".");
                const resource = context.develop.resources[name];
                const plugin = context.plugins
                    .byType("cli-develop-resource")
                    .find(pl => pl.component === resource.component);

                value = plugin.interpolateReference(
                    { reference: props.join("."), resource },
                    context
                );
            }

            map[key] = value;
        });

        context.plugins.byType("cli-develop-set-env-variables").forEach(pl => {
            pl.setVariables({ env: map }, context);
        });

        Object.assign(process.env, map);
    };

    const target = context.develop.resources[name];
    if (!target) {
        throw new Error(`Target function "${name}" was not found!`);
    }

    const { inputs } = context.develop.resources[name];

    const code = join(process.cwd(), context.develop.stack, inputs.code);

    if (!fs.existsSync(code)) {
        const msg = `Target function "${name}" code doesn't exist at ${code}!`;
        console.log(msg);
        throw new Error(msg);
    }

    const [file, exp] = inputs.handler.split(".");

    // Set process.env
    setEnvironmentVariables(inputs.env || {});

    // Base64 decode
    if (event.isBase64Encoded) {
        event.body = Buffer.from(event.body, "base64").toString("ascii");
        event.isBase64Encoded = false;
    }

    if (!event.body || event.body.includes("IntrospectionQuery")) {
        console.log(green(`Skipping log (irrelevant).`));
    } else {
        console.log(green(event.body));
    }

    // TODO: try executing handler in a sandbox using v8 with localized process.env
    const handler = require(resolve(context.develop.stack, inputs.code, file))[exp];
    return await handler(event, {});
};
