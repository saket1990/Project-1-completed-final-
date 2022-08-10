const jwt = require("jsonwebtoken")

const authorAuth = async function (req, res, next) {
    try {
        const token = req.header('x-api-key')
        if (!token) {
            res.status(403).send({ status: false, msg: "require authentication token in header" })
            return
        }
        const decodedToken = jwt.verify(token, "functionup-radon")
        if (!decodedToken) {
            res.status(403).send({ status: false, msg: "Invalid token" })
        }
        req.authorId = decodedToken.authorId
        next()
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.authorAuth =  authorAuth 