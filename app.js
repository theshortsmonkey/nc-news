const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { handleServerErrors, handlePsqlErrors, handleCustomErrors } = require('./controllers/error.controllers')
const { deleteCommentById } = require('./controllers/comments.controllers')
const { getUsers } = require('./controllers/users.controllers')
const apiRouter = require('./routes/api.router')

app = express()
app.use(express.json())

app.use('/api',apiRouter)

app.get('/api/topics',getTopics)

app.get('/api/users',getUsers)

app.delete('/api/comments/:comment_id',deleteCommentById)

app.all('/*',handleMissingEndpoints)

app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)

function handleMissingEndpoints(req,res) {
  return res.status(404).send({msg:`${req.url} endpoint not found, get /api for a description of available endpoints`})
}
module.exports = app