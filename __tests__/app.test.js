const db = require('../db/connection.js');
const request = require('supertest')
const { app } = require('../app.js')
const seed = require('../db/seeds/seed.js')
const testData = require('../db/data/test-data/index')

beforeEach(() => seed(testData))
afterAll(() => db.end)

describe("/api/topics endpoint", () => {
  test("GET: 200 should return an array of all topics with slug and description properties to the client", () => {
    return request(app)
    .get('/api/topics')
    .expect(200)
    .then(({body}) => {
      expect(body.topics).toHaveLength(3)
      body.topics.forEach((topic) => {
        expect(topic).toHaveProperty('slug')
        expect(topic).toHaveProperty('description')
      })
    })
  })
})