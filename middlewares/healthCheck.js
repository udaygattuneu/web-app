const healthCheckMiddleware = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');

    if (Object.keys(req.body).length !== 0 || Object.keys(req.query).length !== 0) {
        return res.status(400).send();
    }

    next();
};

const methodNotAllowed = (req, res) => {
    res.setHeader('Cache-Control', 'no-cache').status(405).send();
};


export { healthCheckMiddleware, methodNotAllowed };
