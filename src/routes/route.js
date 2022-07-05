const express = require("express")
const router = express.Router()

const Authorcontroller = require("../controllers/AuthorController")
const BlogController = require("../controllers/BlogsController")
const middlewares = require("../middlewares/auth")



router.post('/authors', Authorcontroller.createAuthor)
router.post('/login', Authorcontroller.loginAuthor)

router.post('/blogs', middlewares.authorAuth, BlogController.createBlog)
router.get('/blogs', middlewares.authorAuth, BlogController.listBlog)
router.put('/blogs/:blogId', middlewares.authorAuth, BlogController.updateBlogs)
router.delete('/blogs/:blogId', middlewares.authorAuth, BlogController.deleteBlogsbyId)
router.delete('/blogs?queryParams', middlewares.authorAuth, BlogController.deleteBlogsbyparams)

module.exports = router