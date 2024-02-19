const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')
const { handleMissingEndpoints, handleServerErrors } = require('./controllers/error.controllers')

app = express()

app.get('/api/topics',getTopics)
app.get('',)

app.use(handleMissingEndpoints)
app.use(handleServerErrors)


module.exports = {app}
