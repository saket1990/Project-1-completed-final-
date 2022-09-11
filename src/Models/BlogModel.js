const mongoose = require("mongoose")
const AuthorModel = require("./AuthorModel")
const ObjectId = mongoose.Schema.Types.ObjectId

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        authorId: {
            type: ObjectId,
            required:true,
            ref: AuthorModel,
            trim: true
        },
        tags: {
            type: [String],
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        subcategory: {
            type: [String],
            trim: true
        },
        deletedAt: "",
        isDeleted: {
            type: Boolean,
            default: false
        },
        publishedAt:"" ,
        isPublished: {
            type: Boolean,
            default: false
        }, 
    },{timestamps:true})

module.exports = new mongoose.model("BlogModel", blogSchema)
