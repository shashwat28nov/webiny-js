module.exports = {
    projectName: "webiny-js",
    cli: {
        plugins: [
            require("../../experiments/packages/cli-plugin-develop")(),
            require("@webiny/cwp-template-full/hooks/api")(),
            require("@webiny/cwp-template-full/hooks/apps")(),
            require("@webiny/cli-plugin-scaffold"),
            require("@webiny/cli-plugin-scaffold-graphql-service"),
            require("@webiny/cli-plugin-scaffold-lambda")
        ]
    }
};
