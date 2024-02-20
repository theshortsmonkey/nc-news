const express = require('express')
const fs = require('fs/promises')
const { getTopics } = require('./controllers/topics.controllers')
const { handleServerErrors, handlePsqlErrors, handleCustomErrors } = require('./controllers/error.controllers')
const { getArticleById, getArcticles, getArticleCommentsByArticleId, getCommentsByArticleId, postCommentByArticleId, patchArticleById } = require('./controllers/articles.controllers')
const { deleteCommentById } = require('./controllers/comments.controllers')

app = express()

app.get('/api',getApiDetails)
app.get('/api/topics',getTopics)

app.get('/api/articles',getArcticles)
app.get('/api/articles/:article_id',getArticleById)
app.get('/api/articles/:article_id/comments',getCommentsByArticleId)

app.delete('/api/comments/:comment_id',deleteCommentById)

app.use(express.json())
app.post('/api/articles/:article_id/comments',postCommentByArticleId)
app.patch('/api/articles/:article_id',patchArticleById)

app.all('/*',handleMissingEndpoints)

app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)

function getApiDetails(req,res,next) {
  const endpoints = require(`${__dirname}/endpoints.json`)
  return res.status(200).send({endpoints})
}

function handleMissingEndpoints(req,res) {
  return res.status(404).send({msg:`${req.url} endpoint not found, get /api for a description of available endpoints`})
}
module.exports = app