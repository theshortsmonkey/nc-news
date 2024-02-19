const db = require('../db/connection.js')
const request = require('supertest')
const app = require('../app.js')
const seed = require('../db/seeds/seed.js')
const testData = require('../db/data/test-data/index')
const fs = require('fs/promises')

beforeEach(() => seed(testData))
afterAll(() => db.end)

describe('/api/topics endpoint', () => {
  test('GET: 200 should return an array of all topics with slug and description properties to the client', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3)
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty('slug')
          expect(topic).toHaveProperty('description')
        })
      })
  })
})
describe('/api endpoint', () => {
  test('GET: 200 should return an object describing all available endpoints', () => {
    return fs
      .readFile(`${__dirname}/../endpoints.json`, 'utf8')
      .then((body) => {
        const expected = JSON.parse(body)
        return Promise.all([request(app).get('/api').expect(200), expected])
      })
      .then((res) => {
        const { body } = res[0]
        const expected = res[1]
        expect(body.endpoints).toEqual(expected)
      })
  })
})
describe('error handling', () => {
  test('404 for missing endpoints', () => {
    return request(app)
      .get('/api/missing')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('/api/missing endpoint not found, get /api for a description of available endpoints')
      })
  })
})
