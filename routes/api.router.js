const apiRouter = require('express').Router()
const articlesRouter = require('./articles.router')
const commentsRouter = require('./comments.router')
const topicsRouter = require('./topics.router')
const usersRouter = require('./users.router')

apiRouter.get('/',getApiDetails)

apiRouter.use('/articles',articlesRouter)

apiRouter.use('/topics',topicsRouter)

apiRouter.use('/users',usersRouter)

apiRouter.use('/comments',commentsRouter)

function getApiDetails(req,res,next) {
  const endpoints = require(`${__dirname}/../endpoints.json`)
  return res.status(200).send({endpoints})
}

module.exports = apiRouter