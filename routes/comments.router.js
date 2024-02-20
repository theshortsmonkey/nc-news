const commentsRouter = require('express').Router()
const { deleteCommentById } = require('../controllers/comments.controllers')

commentsRouter
.route('/:comment_id')
.delete(deleteCommentById)

module.exports = commentsRouter