const { getLayerArn } = require("@webiny/aws-layers");

const apolloServiceEnv = {
    DEBUG: "true",
    DB_PROXY_FUNCTION: "${databaseProxy.arn}",
    GRAPHQL_INTROSPECTION: process.env.GRAPHQL_INTROSPECTION,
    GRAPHQL_PLAYGROUND: process.env.GRAPHQL_PLAYGROUND,
    JWT_TOKEN_EXPIRES_IN: "2592000",
    JWT_TOKEN_SECRET: process.env.JWT_SECRET,
    SETTINGS_MANAGER_FUNCTION: "${settingsManager.arn}"
};
const apolloGatewayServices = {
    LAMBDA_SERVICE_I18N: "${i18nGraphQL.name}"
};

module.exports = () => ({
    resources: {
        lambdaRole: {
            deploy: {
                component: "@webiny/serverless-aws-iam-role",
                inputs: {
                    region: process.env.AWS_REGION,
                    service: "lambda.amazonaws.com",
                    policy: {
                        arn: "arn:aws:iam::aws:policy/AdministratorAccess"
                    }
                }
            }
        },
        apolloGateway: {
            watch: ["./apolloGateway/build"],
            build: {
                root: "./apolloGateway",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    region: process.env.AWS_REGION,
                    description: "Apollo Gateway",
                    code: "./apolloGateway/build",
                    handler: "handler.handler",
                    memory: 512,
                    timeout: 30,
                    env: { ...apolloServiceEnv, ...apolloGatewayServices }
                }
            }
        },
        databaseProxy: {
            build: {
                root: "./databaseProxy",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    region: process.env.AWS_REGION,
                    description: "Handles interaction with MongoDB",
                    code: "./databaseProxy/build",
                    concurrencyLimit: 15,
                    handler: "handler.handler",
                    memory: 512,
                    timeout: 30,
                    env: {
                        MONGODB_SERVER: process.env.MONGODB_SERVER,
                        MONGODB_NAME: process.env.MONGODB_NAME
                    }
                }
            }
        },
        settingsManager: {
            watch: ["./settingsManager/build"],
            build: {
                root: "./settingsManager",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    description: "Settings Manager",
                    region: process.env.AWS_REGION,
                    code: "./settingsManager/build",
                    handler: "handler.handler",
                    memory: 128,
                    timeout: 20,
                    env: {
                        DB_PROXY_FUNCTION: "${databaseProxy.arn}",
                        DEBUG: process.env.DEBUG
                    }
                }
            }
        },
        i18nGraphQL: {
            watch: ["./i18n/graphql/build"],
            build: {
                root: "./i18n/graphql",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    region: process.env.AWS_REGION,
                    description: "I18N GraphQL API",
                    code: "./i18n/graphql/build",
                    handler: "handler.handler",
                    memory: 512,
                    env: apolloServiceEnv
                }
            }
        },
        i18nLocales: {
            watch: ["./i18n/locales/build"],
            build: {
                root: "./i18n/locales",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    region: process.env.AWS_REGION,
                    code: "./i18n/locales/build",
                    handler: "handler.handler",
                    memory: 256,
                    timeout: 30,
                    env: {
                        DB_PROXY_FUNCTION: "${databaseProxy.arn}",
                        DEBUG: process.env.DEBUG
                    }
                }
            }
        },
        hello: {
            build: {
                root: "./hello",
                script: "yarn build"
            },
            deploy: {
                component: "@webiny/serverless-function",
                inputs: {
                    role: "${lambdaRole.arn}",
                    region: process.env.AWS_REGION,
                    code: "./hello/build",
                    handler: "handler.handler",
                    memory: 256,
                    timeout: 30
                }
            }
        },
        api: {
            component: "@webiny/serverless-api-gateway",
            inputs: {
                region: process.env.AWS_REGION,
                description: "Main API Gateway",
                binaryMediaTypes: ["*/*"],
                endpoints: [
                    {
                        path: "/graphql",
                        method: "ANY",
                        function: "${apolloGateway.arn}"
                    },
                    {
                        path: "/hello",
                        method: "ANY",
                        function: "${hello.arn}"
                    }
                ]
            }
        },
        cdn: {
            component: "@webiny/serverless-aws-cloudfront",
            inputs: {
                origins: [
                    {
                        url: "${api.url}",
                        pathPatterns: {
                            "/graphql": {
                                ttl: 0,
                                forward: {
                                    headers: ["Accept", "Accept-Language"]
                                },
                                allowedHttpMethods: [
                                    "GET",
                                    "HEAD",
                                    "OPTIONS",
                                    "PUT",
                                    "POST",
                                    "PATCH",
                                    "DELETE"
                                ]
                            },
                            "/files/*": {
                                ttl: 2592000 // 1 month
                            },
                            "/cms*": {
                                ttl: 0,
                                forward: {
                                    headers: ["Accept", "Accept-Language"]
                                },
                                allowedHttpMethods: [
                                    "GET",
                                    "HEAD",
                                    "OPTIONS",
                                    "PUT",
                                    "POST",
                                    "PATCH",
                                    "DELETE"
                                ]
                            }
                        }
                    }
                ]
            }
        }
    }
});
