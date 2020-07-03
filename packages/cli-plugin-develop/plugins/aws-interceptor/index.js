const { RequestInterceptor } = require("node-request-interceptor");

module.exports = {
    type: "cli-develop-before-resources",
    name: "cli-develop-before-resources-aws",
    async run({ resources }, context) {
        console.log(`Attaching AWS listener...`);
        const interceptor = new RequestInterceptor();
        interceptor.use(req => {
            console.log("%s %s", req.method, req.url.href);
        });
    }
};
