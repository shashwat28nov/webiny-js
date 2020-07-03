const fs = require("fs");

module.exports = {
    type: "cli-develop-before-resources",
    name: "cli-develop-before-resources-mongo",
    async run({ resources }, context) {
        // TODO: once everything else is working, enable local DB

        console.log(`Setup MongoDB server`);
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const dbPath = context.resolve("dbdata");

        if (!fs.existsSync(dbPath)) {
            fs.ensureDirSync(dbPath);
        }

        const mongod = new MongoMemoryServer({
            instance: {
                port: 59298,
                dbName: process.env.MONGODB_NAME,
                dbPath,
                storageEngine: "wiredTiger"
            }
        });

        const uri = await mongod.getUri();
        console.log(`> MongoDB server running on ${uri}`);

        context.plugins.register({
            type: "cli-develop-set-env-variables",
            setVariables({ env }) {
                if (env.MONGODB_SERVER) {
                    env.MONGODB_SERVER = uri;
                }
            }
        });
    }
};
