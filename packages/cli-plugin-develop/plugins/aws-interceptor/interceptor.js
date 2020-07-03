const { blue, red } = require("chalk");
const { inherits } = require("util");
const http = require("http");
const url = require("url");

module.exports = context => {
    function overrideRequests(newRequest) {
        ["http", "https"].forEach(function(proto) {
            const module = {
                http: require("http"),
                https: require("https")
            }[proto];
            const overriddenRequest = module.request;
            const overriddenGet = module.get;

            module.request = function(input, options, callback) {
                return newRequest(proto, overriddenRequest.bind(module), [
                    input,
                    options,
                    callback
                ]);
            };

            module.get = function(input, options, callback) {
                const req = newRequest(proto, overriddenGet.bind(module), [
                    input,
                    options,
                    callback
                ]);
                req.end();
                return req;
            };
        });
    }

    function urlToOptions(url) {
        const options = {
            protocol: url.protocol,
            hostname:
                typeof url.hostname === "string" && url.hostname.startsWith("[")
                    ? url.hostname.slice(1, -1)
                    : url.hostname,
            hash: url.hash,
            search: url.search,
            pathname: url.pathname,
            path: `${url.pathname}${url.search || ""}`,
            href: url.href
        };
        if (url.port !== "") {
            options.port = Number(url.port);
        }
        if (url.username || url.password) {
            options.auth = `${url.username}:${url.password}`;
        }
        return options;
    }

    function normalizeClientRequestArgs(input, options, cb) {
        if (typeof input === "string") {
            input = urlToOptions(new url.URL(input));
        } else if (input instanceof url.URL) {
            input = urlToOptions(input);
        } else {
            cb = options;
            options = input;
            input = null;
        }

        if (typeof options === "function") {
            cb = options;
            options = input || {};
        } else {
            options = Object.assign(input || {}, options);
        }

        return { options, callback: cb };
    }

    function OverriddenClientRequest(...args) {
        const { options, callback } = normalizeClientRequestArgs(...args);

        console.log("options", options);
        console.log("OverriddenClientRequest", this);

        http.OutgoingMessage.call(this);

        //  Filter the interceptors per request options.
        if (true) {
            this.once("response", callback);
        } else {
            originalClientRequest.apply(this, args);
        }
    }
    inherits(OverriddenClientRequest, http.ClientRequest);

    //  Override the http module's request but keep the original so that we can use it and later restore it.
    //  NOTE: We only override http.ClientRequest as https module also uses it.
    const originalClientRequest = http.ClientRequest;
    http.ClientRequest = OverriddenClientRequest;

    overrideRequests(function(proto, overriddenRequest, args) {
        const { options, callback } = normalizeClientRequestArgs(...args);

        // The option per the docs is `protocol`. Its unclear if this line is meant to override that and is misspelled or if
        // the intend is to explicitly keep track of which module was called using a separate name.
        // Either way, `proto` is used as the source of truth from here on out.
        options.proto = proto;
        
        console.log("options", options);
        
        // TODO: missing Socket blah blah

        return new http.ClientRequest(options, callback);
    });
};
