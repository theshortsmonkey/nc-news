const express = require('express')
const fs = require('fs/promises')
const { getTopics } = require('./controllers/topics.controllers')
const { handleMissingEndpoints, handleServerErrors } = require('./controllers/error.controllers')

app = express()

app.get('/api',(req,res,next) => {
  return fs.readFile(`${__dirname}/endpoints.json`)
  .then((rawEndpoints) => {
    const endpoints = JSON.parse(rawEndpoints)
    res.status(200).send({endpoints})
  })
})
app.get('/api/topics',getTopics)

app.use(handleMissingEndpoints)
app.use(handleServerErrors)


module.exports = app
