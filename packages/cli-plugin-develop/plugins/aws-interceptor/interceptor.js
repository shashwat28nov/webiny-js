const nock = require("nock");

module.exports = context => {
    nock(/amazonaws.com/)
        .persist()
        .post(/.*/)
        .reply(async function(uri, requestBody, callback) {
            const plugins = context.plugins.byType("cli-develop-sdk-handler");

            const params = { req: this.req, requestBody: JSON.parse(requestBody) };

            for (let i = 0; i < plugins.length; i++) {
                if (plugins[i].canHandle(params, context)) {
                    const result = await plugins[i].handle(params, context);
                    return callback(null, result);
                }
            }

            throw Error(`No plugin could handle ${this.req.options.hostname}${this.req.path}!`);
        });
};
