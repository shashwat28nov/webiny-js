const IMAGE_NAME = "motoserver/moto";

module.exports = {
    type: "cli-develop-resource",
    component: "@webiny/serverless-aws-s3",
    async run({ resource }, context) {
        console.log(`> Setup S3 container`);
        const getPort = require("get-port");
        const port = await getPort();

        context.plugins.register({
            type: "cli-develop-sdk-handler",
            canHandle({ req }) {
                console.log(`s3 canHandle`, req);
                return req.hostname.startsWith("s3");
            },
            handle({ req, requestBody }, context) {
                console.log(req);
                console.log(requestBody);
            }
        });

        const Docker = require("dockerode");
        const docker = new Docker();

        console.log(`> Pulling image "${IMAGE_NAME}"...`);
        await new Promise(resolve => {
            docker.pull(IMAGE_NAME, function(err, stream) {
                docker.modem.followProgress(stream, onFinished);

                function onFinished(err) {
                    if (!err) {
                        return resolve();
                    }
                    throw err;
                }
            });
        });

        console.log(`> Creating container...`);

        const container = await docker.createContainer({
            Image: IMAGE_NAME,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: ["s3"],
            HostConfig: {
                PortBindings: {
                    "5000/tcp": [
                        {
                            HostPort: String(port)
                        }
                    ]
                }
            }
        });

        const containerId = container.id.substring(0, 12);

        return new Promise(resolve => {
            context.onExit(async () => {
                console.log(`Stopping S3 (${containerId})...`);
                try {
                    await container.stop();
                } catch (err) {
                    console.log(err.message);
                }
            });

            container.start(err => {
                if (err) {
                    throw err;
                }
                console.log("> Started S3 container:", containerId);
                resolve();
            });
        });
    }
};
