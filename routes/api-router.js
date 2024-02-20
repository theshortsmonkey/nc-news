const apiRouter = require('express').Router()

apiRouter.get('/',getApiDetails)

function getApiDetails(req,res,next) {
  const endpoints = require(`${__dirname}/../endpoints.json`)
  return res.status(200).send({endpoints})
}

module.exports = apiRouter