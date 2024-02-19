const express = require('express')
const { getTopics } = require('./controllers/topics.controllers')

app = express()

app.get('/api/topics',getTopics)


module.exports = {app}
