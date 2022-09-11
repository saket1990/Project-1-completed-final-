const mongoose = require("mongoose")
const authorSchema = new mongoose.Schema(
    {
        fname: {
            type: String,
            required: true,
            trim: true
        },
        lname: {
            type: String,
            required: true,
            trim: true
        },
        title: {
            type:String,
            enum: ["Mr", "Mrs", "Miss"],
        },
        email: {
            required: true,
            type: String,
            unique: true,
            validate: (email) => { return (/(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/).test(email) }
        },
        password: {
            type: String,
            required: "password is required"
        },
    },{timestamps:true})

module.exports = new mongoose.model("AuthorModel", authorSchema)
