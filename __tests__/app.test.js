const db = require('../db/connection.js')
const request = require('supertest')
const app = require('../app.js')
const seed = require('../db/seeds/seed.js')
const testData = require('../db/data/test-data/index')
const fs = require('fs/promises')
const { convertTimestampToDate } = require('../db/seeds/utils.js')

beforeEach(() => seed(testData))
afterAll(() => db.end)

describe('routing issues', () => {
  test('404 for missing endpoints', () => {
    return request(app)
      .get('/api/missing')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('/api/missing endpoint not found, get /api for a description of available endpoints')
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
describe('/api/articles/:article_id endpoint', () => {
  test("GET: 200 should return the article identified by the specified article_id", () => {
    const expectedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    }
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then(({body}) => {
      expect(body.article).toEqual(expectedArticle)
    })
  })
  test("GET: 400 when requesting an article with an invalid id", () => {
    return request(app)
    .get('/api/articles/cat')
    .expect(400)
    .then(({body}) => {
      expect(body.msg).toEqual('invalid id supplied')
    })
  })
  test("GET: 404 when requesting an article with an id that doesn't exist", () => {
    return request(app)
    .get('/api/articles/99999')
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toEqual('requested ID not found')
    })
  })
})
