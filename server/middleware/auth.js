const jwt = require('jsonwebtoken');

const jwtAuth = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(400).send({
            message: "Token is invalid"
        })
    }
    const token = auth.split(" ")[1];
    try {
        const decode = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decode;
        next();
    } catch (err) {
        res.status(401).send({
            message: "Token is expired"
        })
    }
}
module.exports = jwtAuth;