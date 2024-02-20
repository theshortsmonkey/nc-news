const db = require('../db/connection.js')
const request = require('supertest')
const app = require('../app.js')
const seed = require('../db/seeds/seed.js')
const testData = require('../db/data/test-data/index')

beforeEach(() => seed(testData))
afterAll(() => db.end())

describe('routing issues', () => {
  test('404 for missing endpoints', () => {
    return request(app)
      .get('/api/missing')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual(
          '/api/missing endpoint not found, get /api for a description of available endpoints'
        )
      })
  })
})
describe('/api endpoint', () => {
  test('GET: 200 should return an object describing all available endpoints', () => {
    const expected = require(`${__dirname}/../endpoints.json`)
    return request(app).get('/api').expect(200)
      .then(({body}) => {
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
  test('GET: 200 should return the article identified by the specified article_id', () => {
    const expectedArticle = {
      article_id: 1,
      title: 'Living in the shadow of a great man',
      topic: 'mitch',
      author: 'butter_bridge',
      body: 'I find this existence challenging',
      created_at: '2020-07-09T20:11:00.000Z',
      votes: 100,
      article_img_url:
        'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
    }
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        const {comment_count,...article} = body.article
        expect(article).toEqual(expectedArticle)
      })
  })
  test('GET: 400 when requesting an article with an invalid id', () => {
    return request(app)
      .get('/api/articles/cat')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid id supplied')
      })
  })
  test("GET: 404 when requesting an article with an id that doesn't exist", () => {
    return request(app)
      .get('/api/articles/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('requested ID not found')
      })
  })
  test("GET: 200 should include a comment_count of all the comments on the specified article_id", () => {
    return request(app)
    .get('/api/articles/1')
    .expect(200)
    .then(({body}) => {
      expect(body.article.comment_count).toBe(11)
    })
  })
  test('PATCH: 200 should increment the votes of a specified article by the supplied amount', () => {
    const expectedArticle = {
      article_id: 1,
      title: 'Living in the shadow of a great man',
      topic: 'mitch',
      author: 'butter_bridge',
      body: 'I find this existence challenging',
      created_at: '2020-07-09T20:11:00.000Z',
      votes: 105,
      article_img_url:
        'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
    }
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual(expectedArticle)
      })
  })
  test('PATCH: 200 should increment the votes of a specified article by the supplied amount,ignoring unnessecary properties in requested body', () => {
    const expectedArticle = {
      article_id: 1,
      title: 'Living in the shadow of a great man',
      topic: 'mitch',
      author: 'butter_bridge',
      body: 'I find this existence challenging',
      created_at: '2020-07-09T20:11:00.000Z',
      votes: 105,
      article_img_url:
        'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
    }
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 5, article_id: 'test' })
      .expect(200)
      .then(({ body }) => {
        expect(body.updatedArticle).toEqual(expectedArticle)
      })
  })
  test('PATCH: 400 when attempting to update an article with an invalid id', () => {
    return request(app)
      .patch('/api/articles/cat')
      .send({ inc_votes: 5 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid id supplied')
      })
  })
  test("PATCH: 404 when attempting to udpate an article with an id that doesn't exist", () => {
    return request(app)
      .patch('/api/articles/99999')
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('requested ID not found')
      })
  })
  test('PATCH: 400 when attempting to update an article with an invalid vote count', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_votes: 'cat' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid vote increment supplied')
      })
  })
  test('PATCH: 400 when attempting to update an article without an inc_votes value', () => {
    return request(app)
      .patch('/api/articles/1')
      .send({ inc_comments: 5 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid vote increment supplied')
      })
  })
})
describe('/api/articles endpoint', () => {
  test('GET: 200 should return an array of all articles, all articles should have the following core properties: article_id,author,title,topic,created_at,votes,article_img_url', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13)
        body.articles.forEach((article) => {
          expect(typeof article.article_id).toBe('number')
          expect(typeof article.author).toBe('string')
          expect(typeof article.title).toBe('string')
          expect(typeof article.topic).toBe('string')
          expect(typeof article.created_at).toBe('string')
          expect(typeof article.votes).toBe('number')
          expect(typeof article.article_img_url).toBe('string')
        })
      })
  })
  test('GET: 200 should return an array of all articles, sorted by date created in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
      })
  })
  test('GET: 200 returned articles should have a comment_count which is the total count of all comments on each article_id', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].comment_count).toBe(2)
        body.articles.forEach((article) => {
          expect(typeof article.comment_count).toBe('number')
        })
      })
  })
  test('GET: 200 none of the returned articles should have a body property', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty('body')
        })
      })
  })
  test("GET: 200 returned articles should be filtered by the specified topic in the supplied query", () => {
    return request(app)
    .get('/api/articles?topic=mitch')
    .expect(200)
    .then(({body}) => {
      expect(body.articles).toHaveLength(12)
      body.articles.forEach((article) => {
        expect(article.topic).toEqual('mitch')
      })
    })
  })
  test("GET 204 when supplied topic that has no articles associated with it", () => {
    return request(app)
    .get('/api/articles?topic=paper')
    .expect(204)
  })
  test("GET: 404 when supplied a topic that doesn't exist", () => {
    return request(app)
    .get('/api/articles?topic=wood')
    .expect(404)
    .then(({body}) => {
      expect(body.msg).toEqual('topic does not exist in database')
    })
  })
})
describe('/api/articles/:article_id/comments endpoint', () => {
  test('GET: 200 should return an array of all comments for the supplied article id. Each comment should have properties: comment_id,votes,created_at,author,body & article_id', () => {
    return request(app)
      .get('/api/articles/3/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(2)
        body.comments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe('number')
          expect(typeof comment.votes).toBe('number')
          expect(typeof comment.created_at).toBe('string')
          expect(typeof comment.author).toBe('string')
          expect(typeof comment.body).toBe('string')
          expect(typeof comment.article_id).toBe('number')
        })
      })
  })
  test('GET: 200 returned comments should be sorted by most recent first', () => {
    return request(app)
      .get('/api/articles/3/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy('created_at', { descending: true })
      })
  })
  test('GET: 400 when requesting comments from an article using an invalid id', () => {
    return request(app)
      .get('/api/articles/cat/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid id supplied')
      })
  })
  test("GET: 404 when requesting comments from an article with an id that doesn't exist", () => {
    return request(app)
      .get('/api/articles/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('requested ID not found')
      })
  })
  test('POST: 201 should return the posted comment', () => {
    return request(app)
      .post('/api/articles/3/comments')
      .send({ username: 'butter_bridge', body: 'Gotta love a pug gif' })
      .expect(201)
      .then(({ body }) => {
        const { postedComment } = body
        expect(postedComment.author).toBe('butter_bridge')
        expect(postedComment.body).toBe('Gotta love a pug gif')
        expect(postedComment.article_id).toBe(3)
        expect(postedComment.votes).toBe(0)
        expect(postedComment.comment_id).toBe(19)
        expect(typeof postedComment.created_at).toBe('string')
      })
  })
  test('POST: 201 should return the posted comment,ignoring unnecessary properties in the suppied body', () => {
    return request(app)
      .post('/api/articles/3/comments')
      .send({
        username: 'butter_bridge',
        body: 'Gotta love a pug gif',
        article_id: 8,
      })
      .expect(201)
      .then(({ body }) => {
        const { postedComment } = body
        expect(postedComment.author).toBe('butter_bridge')
        expect(postedComment.body).toBe('Gotta love a pug gif')
        expect(postedComment.article_id).toBe(3)
        expect(postedComment.votes).toBe(0)
        expect(postedComment.comment_id).toBe(19)
        expect(typeof postedComment.created_at).toBe('string')
      })
  })
  test('POST: 400 when attempt to post a comment to an article using an invalid id', () => {
    return request(app)
      .post('/api/articles/cat/comments')
      .send({ username: 'butter_bridge', body: 'Gotta love a pug gif' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid id supplied')
      })
  })
  test("POST: 404 when attempt to post a comment to an article with an id that doesn't exist", () => {
    return request(app)
      .post('/api/articles/99999/comments')
      .send({ username: 'butter_bridge', body: 'Gotta love a pug gif' })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('requested ID not found')
      })
  })
  test('POST: 400 malformed body/missing required field', () => {
    return request(app)
      .post('/api/articles/3/comments')
      .send({ username: 'butter_bridge' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('body missing required field')
      })
  })
  test('POST: 404 supplied username does not exist in database', () => {
    return request(app)
      .post('/api/articles/3/comments')
      .send({ username: 'test', body: 'test comment' })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('supplied username does not exist in database')
      })
  })
})
describe('/api/comments/:comment_id endpoint', () => {
  test('DELETE: 204 with no content when successfully deleting comment with supplied id', () => {
    return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({})
      })
  })
  test('DELETE: 400 when attempting to delete an article with an invalid id', () => {
    return request(app)
      .delete('/api/comments/cat')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('invalid id supplied')
      })
  })
  test("DELETE: 404 when attempting to udpate an article with an id that doesn't exist", () => {
    return request(app)
      .delete('/api/comments/99999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('requested ID not found')
      })
  })
})
describe('/api/topics endpoint', () => {
  test('GET: 200 should return an array of all users with username, name and avatar_url properties to the client', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4)
        body.users.forEach((user) => {
          expect(typeof user.username).toBe('string')
          expect(typeof user.name).toBe('string')
          expect(typeof user.avatar_url).toBe('string')
        })
      })
  })
})
