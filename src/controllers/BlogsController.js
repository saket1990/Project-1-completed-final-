const { query } = require('express')
const { default: mongoose, isValidObjectId } = require('mongoose')
const AuthorModel = require('../Models/AuthorModel')
const BlogModel = require('../Models/BlogModel')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "String" && value.trim().length === 0) return false
    return true
}
const isValididRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidobjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createBlog = async function (req, res) {
    try {
        const requestBody = req.body

        if (!isValididRequestBody(requestBody)) {
            res.status(400).send({ status: false, msg: "Invalid request parameters, Please provide Blog details " })
            return
        }
        // Extract params
        const { title, body, authorId, tags, category, subcategory, isPublished } = requestBody

        // Validations Start
        if (!isValid(title)) {
            res.status(400).send({ status: false, msg: "Blog title is required" })
        }
        if (!isValid(body)) {
            res.status(400).send({ status: false, msg: "Blog body is required" })
        }
        if (!isValid(authorId)) {
            res.status(400).send({ status: false, msg: "Blog authorId is required" })
        }
        if (!isValidobjectId(authorId)) {
            res.status(400).send({ status: false, msg: `${authorId} is not a valid author Id` })
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, msg: "Blog category is required" })
        }
        const author = await AuthorModel.findById(authorId)
        if (!author) {
            res.status(400).send({ status: false, msg: "author does not exist" })
            return
        }
        // Validation end
        const blogData = {
            title,
            body,
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null,
        }
        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if (Object.prototype.toString.call(tags) === "[Object String]") {
                blogData['tags'] = [tags]
            }
        }
        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[Object String]") {
                blogData['subcategory'] = [subcategory]
            }
            const blogCreated = await BlogModel.create(blogData)
            res.status(201).send({ status: true, msg: "new blog created successfully", data: blogCreated })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const listBlog = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null, ispublished: true }
        const queryParams = req.query
        if (isValididRequestBody(queryParams)) {
            const { authorId, category, tags, subcategory } = queryParams
            if (isValid(authorId) && isValidObjectId(authorId)) {
                filterQuery['authorId'] = authorId
            }
            if (isValid(category)) {
                filterQuery['category'] = category.trim()
            }
            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim())
                filterQuery['tag'] = { $all: tagsArr }
            }
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim())
                filterQuery['subcategory'] = { $all: subcatArr }
            }
        }
        const blogs = await BlogModel.find(filterQuery)
        if (Array.isArray(blogs) && blogs.length === 0) {
            res.status(404).send({ status: false, msg: "No blogs found" })
            return
        }
        res.status(200).send({ status: true, msg: "Blogs List", data: blogs })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const updateBlogs = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = params.authorId

        if (!isValidObjectId(blogId)) {
            res.status(400).send({ status: false, msg: `${blogId} is not a valid blog Id` })
            return
        }
        if (!isValidObjectId(authorIdFromToken)) {
            res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid author Id` })
            return
        }
        const blog = await BlogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
        if (!blog) {
            res.status(404).send({ status: false, msg: "Blog not found" })
            return
        }
        if (blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({ status: false, msg: "unauthorised access" })
            return
        }
        if (isValididRequestBody(requestBody)) {
            res.status(200).send({ status: true, msg: "No Parameter passed, Blog unmodified", data: blog })
            return
        }
        const { title, body, tags, category, subcategory, isPublished } = requestBody
        const updateBlogsdata = {}

        if (isValid(title)) {
            if (Object.prototype.hasOwnProperty.call(updateBlogsdata, '$set')) updateBlogsdata['$set'] = {}
            updateBlogsdata['$set']['title'] = title
        }
        if (isValid(body)) {
            if (Object.prototype.hasOwnProperty.call(updateBlogsdata, '$set')) updateBlogsdata['$set'] = {}
            updateBlogsdata['$set']['body'] = body
        }
        if (isValid(category)) {
            if (Object.prototype.hasOwnProperty.call(updateBlogsdata, '$set')) updateBlogsdata['$set'] = {}
            updateBlogsdata['$set']['category'] = category
        }
        if (isPublished !== undefined) {
            if (Object.prototype.hasOwnProperty.call(updateBlogsdata, '$set')) updateBlogsdata['$set'] = {}
            updateBlogsdata['$set']['isPublished'] = isPublished
            updateBlogsdata['$set']['publishedAt'] = isPublished ? new Date() : null
        }
        if (tags) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogsdata, '$addToSet')) updateBlogsdata['$addToSet'] = {}
            if (Array.isArray(tags)) {
                updateBlogsdata['$addToSet']['tags'] = { $each: [...tags] }
            }
            if (typeof tags === "String") {
                updateBlogsdata['$addToSet']['tags'] = tags
            }
        }
        if (subcategory) {
            if (!Object.prototype.hasOwnProperty.call(updateBlogsdata, '$addToSet')) updateBlogsdata['$addToSet'] = {}
            if (Array.isArray(subcategory)) {
                updateBlogsdata['$addToSet']['subcategory'] = { $each: [...subcategory] }
            }
            if (typeof subcategory === "String") {
                updateBlogsdata['$addToSet']['subcategory'] = subcategory
            }
        }
        const updateBlog = await BlogModel.findOneAndUpdate({ _id: blogId, }, updateBlogsdata, { new: true })
        res.status(200).send({ status: true, msg: "Blog updated successfully", data: updateBlog })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const deleteBlogsbyId = async function (req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if (!isValidObjectId(blogId)) {
            res.status(400).send({ status: false, msg: `${blogId} is not a valid blog Id` })
            return
        }

        if (!isValidObjectId(authorIdFromToken)) {
            res.status(400).send({ status: false, msg: `${authorIdFromToken} is not a valid token Id` })
            return
        }
        const blog = await BlogModel.findone({ _id: blogId, isDeleted: false, deletedAt: null })

        if (!blog) {
            res.status(404).send({ status: false, msg: "Blog not Found" })
            return
        }
        if (blog.authorId.toString() !== authorIdFromToken) {
            res.status(401).send({ status: false, msg: "Unauthorised access!" })
            return
        }
        await BlogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, msg: "Blog deleted successfully" })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const deleteBlogsbyparams = async function (req, res) {
    try {
        const filterQuery={isDeleted:false, deletedAt:null}
        const queryParams= req.query
        const authorIdFromToken= req.authorId

        if(!isValidObjectId(authorIdFromToken)){
            res.status(400).send({status:false,msg:`${authorIdFromToken} is not a valid token id`})
        }
        if(!isValididRequestBody(queryParams)){
            res.status(400).send({status:false,msg:"No query params received"})
            return
        }
        const {authorId,category,tags,subcategory,isPublished}= queryParams
        if(isValid(authorId) && isValidObjectId(authorId)){
            filterQuery['authorId']=authorId
        }
        if(isValid(category)){
            filterQuery['category']=category
        }
        if(isValid(isPublished)){
            filterQuery['isPublished']=isPublished
        }
        if(isValid(tags)){
            const tagsArr= tags.trim().split(',').map(tag=>tag.trim())
            filterQuery['tags']={$all:tagsArr}
        }
        if(isValid(subcategory)){
            const subcatArr= subcategory.trim().split(',').map(subcat=>subcat.trim())
            filterQuery['subcategory']={$all:subcatArr}
        }
        const blogs=await BlogModel.find(filterQuery)
        if(Array.isArray(blogs)&& blogs.length===0){
            res.status(404).send({status:false,msg:"No blogs found"})
        }
        await BlogModel.updateMany({_id:{$in:idsOfBlogsToDelete}},{$set:{isDeleted:true,deletedAt:new Date()}})
        res.status(200).send({status:true,msg:"Blogs deleted successfully"})

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



module.exports = { createBlog, listBlog, updateBlogs, deleteBlogsbyId, deleteBlogsbyparams }