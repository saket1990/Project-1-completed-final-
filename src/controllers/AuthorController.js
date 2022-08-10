const AuthorModel = require("../Models/AuthorModel")
const jwt = require("jsonwebtoken")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "String" && value.trim().length === 0) return false
    return true
}
const isValidtitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) != -1
}
const isValididRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const createAuthor = async function (req, res) {
    try {
        const requestBody = req.body
        if (!isValididRequestBody(requestBody)) {
            res.status(400).send({ status: false, msg: "Please provide Author Details" })
            return
        }
        const { fname, lname, title, email, password } = requestBody

        if (!isValid(fname)) {
            res.status(400).send({ status: false, msg: "first name is required" })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, msg: "last name is required" })
            return
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, msg: "title is required" })
            return
        }

        if (!isValidtitle(title)) {
            res.status(400).send({ status: false, msg: "Title must be Mr,Mrs,Miss" })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: "email is required" })
        }

        if (!(/(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/).test(email)) {
            res.status(400).send({ status: false, msg: "email is invalid!" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, msg: "password is required" })
            return
        }
        const isEmailalreadyused = await AuthorModel.findOne({ email })
        if (isEmailalreadyused) {
            res.status(400).send({ status: false, msg: `${email} email address is already used` })
            return
        }
        const authordata = { fname, lname, title, email, password }
        const newauthor = await AuthorModel.create(authordata)
        res.status(201).send({ status: true, data: newauthor })
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const loginAuthor = async (req, res) => {
    try {
        const requestBody=req.body
        if(!isValididRequestBody(requestBody)){
            res.status(400).send({ status: false, msg: "Please provide Author login Details" }) 
            return 
        }
        const { email, password } = requestBody
        if (!isValid(email)) {
            res.status(400).send({ status: false, msg: "email is required" })
            return
        }
        if (!(/(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/).test(email)) {
            res.status(400).send({ status: false, msg: "email is invalid!" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, msg: "password is required" })
            return
        }
        const author=await AuthorModel.findOne({email,password})
        if(!author){
        res.status(401).send({status:false,msg:"Invalid login details"})
        }
        const token= jwt.sign({
            authorId: author._id.toString(),
            organisation:"functionUp",
            batch:"radon"
        },"functionup-radon")
        res.header('x-api-key',token)
        res.status(200).send({status:true,msg:"Author is login successfully",data:token})
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { createAuthor, loginAuthor }