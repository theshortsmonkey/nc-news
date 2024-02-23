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
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(expected)
      })
  })
})
describe('/api/topics endpoint', () => {
  describe('GET method', () => {
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
  describe('POST method', () => {
    test('POST: 201 should return the newly posted topic', () => {
      const topicToPost = {
        slug: 'dogs',
        description: 'everyone needs to talk about dogs',
      }
      return request(app)
        .post('/api/topics')
        .send(topicToPost)
        .expect(201)
        .then(({ body }) => {
          expect(body.postedTopic).toMatchObject(topicToPost)
        })
    })
    test('POST: 422 topic already exists in database', () => {
      const topicToPost = {
        description: 'Not dogs',
        slug: 'cats',
      }
      return request(app)
        .post('/api/topics')
        .send(topicToPost)
        .expect(422)
        .then(({ res }) => {
          expect(res.text).toBe('requested topic already exists in database')
        })
    })
    test('POST: 400 malformed body/missing required field', () => {
      const topicToPost = {
        description: 'everyone needs to talk about dogs',
      }
      return request(app)
        .post('/api/topics')
        .send(topicToPost)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('body missing required field: "slug"')
        })
    })
  })
})
describe('/api/articles/:article_id endpoint', () => {
  describe('GET method', () => {
    test('GET: 200 should return the article identified by the specified article_id', () => {
      const expectedArticle = {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: '2020-07-09 21:11:00',
        votes: 100,
        article_img_url:
          'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
      }
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject(expectedArticle)
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
    test('GET: 200 should include a comment_count of all the comments on the specified article_id', () => {
      return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body.article.comment_count).toBe(11)
        })
    })
  })
  describe('PATCH method', () => {
    test('PATCH: 200 should increment the votes of a specified article by the supplied amount', () => {
      const expectedArticle = {
        article_id: 1,
        title: 'Living in the shadow of a great man',
        topic: 'mitch',
        author: 'butter_bridge',
        body: 'I find this existence challenging',
        created_at: '2020-07-09 21:11:00',
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
        created_at: '2020-07-09 21:11:00',
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
  describe('DELETE method', () => {
    test('DELETE: 204 and no content when successfully deleting an article', () => {
      return request(app)
        .delete('/api/articles/1')
        .expect(204)
        .then((res) => {
          expect(res.body).toEqual({})
        })
    })
    test('DELETE: 400 when attempting to delete an article with an invalid id', () => {
      return request(app)
        .delete('/api/articles/cat')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual('invalid id supplied')
        })
    })
    test("DELETE: 404 when attempting to delete an article with an id that doesn't exist", () => {
      return request(app)
        .delete('/api/articles/99999')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual('requested ID not found')
        })
    })
  })
})
describe('/api/articles endpoint', () => {
  describe('GET method', () => {
    describe('basic functionailty', () => {
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
            expect(body.articles).toBeSortedBy('created_at', {
              descending: true,
            })
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
    })
    describe('filter functionailty', () => {
      test('GET: 200 returned articles should be filtered by the specified topic in the supplied query', () => {
        return request(app)
          .get('/api/articles?topic=mitch')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toHaveLength(12)
            body.articles.forEach((article) => {
              expect(article.topic).toEqual('mitch')
            })
          })
      })
      test('GET 204 when supplied topic that has no articles associated with it', () => {
        return request(app).get('/api/articles?topic=paper').expect(204)
      })
      test("GET: 404 when supplied a topic that doesn't exist", () => {
        return request(app)
          .get('/api/articles?topic=wood')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toEqual('topic does not exist in database')
          })
      })
      test('GET: 200 returned object has a total_count property set to the total number of articles, discounting the limit', () => {
        return request(app)
          .get('/api/articles?p=2&limit=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.total_count).toBe(13)
          })
      })
      test('GET: 200 returned object has a total_count property set to the total number of articles, with the supplied filter applied', () => {
        return request(app)
          .get('/api/articles?p=2&limit=2&topic=mitch')
          .expect(200)
          .then(({ body }) => {
            expect(body.total_count).toBe(12)
          })
      })
    })
    describe('sort functionality', () => {
      test('GET: 200 uses sort_by query to sort the articles by valid column in descending order', () => {
        return request(app)
          .get('/api/articles?sort_by=votes')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy('votes', { descending: true })
          })
      })
      test('GET: 400 when using a sort_by query with an invalid column name', () => {
        return request(app)
          .get('/api/articles?sort_by=username')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toEqual('invalid sort column')
          })
      })
      test('GET: 200 uses order query to define the sort order of the supplied articles', () => {
        return request(app)
          .get('/api/articles?order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy('created_at', {
              descending: false,
            })
          })
      })
      test('GET: 400 when using a order query with an invalid direction', () => {
        return request(app)
          .get('/api/articles?order=none')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toEqual('invalid sort order')
          })
      })
      test('GET: 200 multiple valid queries processed correctly', () => {
        return request(app)
          .get('/api/articles?sort_by=author&order=asc&topic=mitch')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toHaveLength(12)
            body.articles.forEach((article) => {
              expect(article.topic).toBe('mitch')
            })
            expect(body.articles).toBeSortedBy('author', { descending: false })
          })
      })
    })
    describe('pagination functionality', () => {
      test('GET: 200 uses limit query to limit the number of articles returned', () => {
        return request(app)
          .get('/api/articles?limit=5')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).toBe(5)
          })
      })
      test("GET: 200 'p' query should offset the returned articles from the top of the full list, based on default the limit value(10)", () => {
        return request(app)
          .get('/api/articles?p=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).toBe(3)
            expect(body.articles[0].article_id).toBe(8)
          })
      })
      test("GET: 200 'p' query should offset the returned articles from the top of the full list, based on the supplied limit value", () => {
        return request(app)
          .get('/api/articles?p=2&limit=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).toBe(2)
            expect(body.articles[0].article_id).toBe(2)
            expect(body.articles[1].article_id).toBe(13)
          })
      })
      test('GET: 400 when requesting a limit with an invalid value', () => {
        return request(app)
          .get('/api/articles?limit=cat')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('invalid query string')
          })
      })
      test('GET: 400 when requesting a page with an invalid value', () => {
        return request(app)
          .get('/api/articles?p=cat')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('invalid query string')
          })
      })
    })
  })
  describe('POST method', () => {
    test('POST: 201 should return the posted article', () => {
      return request(app)
        .post('/api/articles/')
        .send({
          author: 'butter_bridge',
          title: 'Yet another article about pugs',
          body: 'Gotta love those squished little faces',
          topic: 'cats',
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.postedArticle).toMatchObject({
            author: 'butter_bridge',
            title: 'Yet another article about pugs',
            body: 'Gotta love those squished little faces',
            topic: 'cats',
            article_img_url:
              'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700',
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          })
        })
    })
    test('POST: 201 should return the posted article,ignoring unnecessary properties in the suppied body', () => {
      return request(app)
        .post('/api/articles/')
        .send({
          author: 'butter_bridge',
          title: 'Yet another article about pugs',
          body: 'Gotta love those squished little faces',
          topic: 'cats',
          type: 'hello',
          extras: 'should be skipped',
        })
        .expect(201)
        .then(({ body }) => {
          expect(body.postedArticle).toMatchObject({
            author: 'butter_bridge',
            title: 'Yet another article about pugs',
            body: 'Gotta love those squished little faces',
            topic: 'cats',
            article_img_url:
              'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700',
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          })
        })
    })
    test('POST: 400 malformed body/missing required field', () => {
      return request(app)
        .post('/api/articles')
        .send({
          author: 'butter_bridge',
          title: 'Yet another article about pugs',
          body: 'Gotta love those squished little faces',
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('body missing required field: "topic"')
        })
    })
    test('POST: 404 supplied username does not exist in database', () => {
      return request(app)
        .post('/api/articles/')
        .send({
          author: 'unknown',
          title: 'Yet another article about pugs',
          body: 'Gotta love those squished little faces',
          topic: 'cats',
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('supplied username does not exist in database')
        })
    })
    test('POST: 404 supplied topic does not exist in database', () => {
      return request(app)
        .post('/api/articles/')
        .send({
          author: 'butter_bridge',
          title: 'Yet another article about pugs',
          body: 'Gotta love those squished little faces',
          topic: 'dogs',
        })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('supplied topic does not exist in database')
        })
    })
  })
})
describe('/api/articles/:article_id/comments endpoint', () => {
  describe('GET method', () => {
    describe('basic functionailty', () => {
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
            expect(body.comments).toBeSortedBy('created_at', {
              descending: true,
            })
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
      test('GET: 200 returned object has a total_count property set to the total number of articles, discounting the limit', () => {
        return request(app)
          .get('/api/articles/1/comments?p=2&limit=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.total_count).toBe(11)
          })
      })
    })
    describe('pagination functionality', () => {
      test('GET: 200 uses limit query to limit the number of comments returned', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=5')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(5)
          })
      })
      test("GET: 200 'p' query should offset the returned comments from the top of the full list, based on default the limit value(10)", () => {
        return request(app)
          .get('/api/articles/1/comments?p=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(1)
            expect(body.comments[0].comment_id).toBe(9)
          })
      })
      test("GET: 200 'p' query should offset the returned comments from the top of the full list, based on the supplied limit value", () => {
        return request(app)
          .get('/api/articles/1/comments?p=2&limit=2')
          .expect(200)
          .then(({ body }) => {
            expect(body.comments.length).toBe(2)
            expect(body.comments[0].comment_id).toBe(18)
            expect(body.comments[1].comment_id).toBe(13)
          })
      })
      test('GET: 400 when requesting a limit with an invalid value', () => {
        return request(app)
          .get('/api/articles/1/comments?limit=cat')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('invalid query string')
          })
      })
      test('GET: 400 when requesting a page with an invalid value', () => {
        return request(app)
          .get('/api/articles/1/comments?p=cat')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe('invalid query string')
          })
      })
    })
  })
  describe('POST method', () => {
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
          expect(body.msg).toEqual('body missing required field: "body"')
        })
    })
    test('POST: 404 supplied username does not exist in database', () => {
      return request(app)
        .post('/api/articles/3/comments')
        .send({ username: 'test', body: 'test comment' })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual(
            'supplied username does not exist in database'
          )
        })
    })
  })
})
describe('/api/comments/:comment_id endpoint', () => {
  describe('DELETE method', () => {
    test('DELETE: 204 with no content when successfully deleting comment with supplied id', () => {
      return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then((res) => {
          expect(res.body).toEqual({})
        })
    })
    test('DELETE: 400 when attempting to delete a comment with an invalid id', () => {
      return request(app)
        .delete('/api/comments/cat')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual('invalid id supplied')
        })
    })
    test("DELETE: 404 when attempting to delete a comment with an id that doesn't exist", () => {
      return request(app)
        .delete('/api/comments/99999')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual('requested ID not found')
        })
    })
  })
  describe('PATCH method', () => {
    test('PATCH: 200 should increment the votes of a specified comment by the supplied amount', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 4 })
        .expect(200)
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: 'butter_bridge',
            votes: 20,
            created_at: '2020-04-06 13:17:00',
          })
        })
    })
    test('PATCH: 200 should decrement the votes of a specified comment by the supplied amount', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: -6 })
        .expect(200)
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: 'butter_bridge',
            votes: 10,
            created_at: '2020-04-06 13:17:00',
          })
        })
    })
    test('PATCH: 200 should increment the votes of a specified comment by the supplied amount,ignoring unnessecary properties in requested body', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 4, article_id: 10 })
        .expect(200)
        .then(({ body }) => {
          expect(body.updatedComment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            article_id: 9,
            author: 'butter_bridge',
            votes: 20,
            created_at: '2020-04-06 13:17:00',
          })
        })
    })
    test('PATCH: 400 when attempting to update a comment with an invalid id', () => {
      return request(app)
        .patch('/api/comments/cat')
        .send({ inc_votes: 4 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('invalid id supplied')
        })
    })
    test("PATCH: 404 when attempting to udpate a comment with an id that doesn't exist", () => {
      return request(app)
        .patch('/api/comments/99999')
        .send({ inc_votes: 4 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('requested ID not found')
        })
    })
    test('PATCH: 400 when attempting to update a comment with an invalid vote count', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({ inc_votes: 'cat' })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('invalid vote increment supplied')
        })
    })
    test('PATCH: 400 when attempting to update a comment without an inc_votes value', () => {
      return request(app)
        .patch('/api/comments/1')
        .send({ inc_article_id: 4 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('invalid vote increment supplied')
        })
    })
  })
})
describe('/api/users endpoint', () => {
  describe('GET method', () => {
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
})
describe('/api/users/:username endpoint', () => {
  describe('GET method', () => {
    test('GET: 200 should a user with username, avatar_url and name properties', () => {
      return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({ body }) => {
          expect(body.user).toMatchObject({
            username: 'butter_bridge',
            avatar_url:
              'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'jonny',
          })
        })
    })
    test("GET: 404 when requesting a user with an username that doesn't exist", () => {
      return request(app)
        .get('/api/users/mitch')
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual('requested username not found')
        })
    })
  })
})
