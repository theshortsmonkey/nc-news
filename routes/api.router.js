const apiRouter = require('express').Router()
const articlesRouter = require('./articles.router')

apiRouter.get('/',getApiDetails)

apiRouter.use('/articles',articlesRouter)

function getApiDetails(req,res,next) {
  const endpoints = require(`${__dirname}/../endpoints.json`)
  return res.status(200).send({endpoints})
}

module.exports = apiRouter