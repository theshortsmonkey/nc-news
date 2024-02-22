const db = require('../db/connection.js')

exports.selectArticles = (
  topic,
  sortBy = 'created_at',
  order = 'desc',
  limit = 10,
  p = 0
) => {
  const allowedSortByVals = [
    'created_at',
    'article_id',
    'title',
    'topic',
    'author',
    'votes',
  ]
  if (!allowedSortByVals.includes(sortBy)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort column' })
  }
  const allowedOrderVals = ['asc', 'desc']
  if (!allowedOrderVals.includes(order)) {
    return Promise.reject({ status: 400, customErrMsg: 'invalid sort order' })
  }
  if (!(limit >= 0) || !(p >= 0)) {
    return Promise.reject({status:400, customErrMsg:'invalid query string'})
  }
  let countQueryString = `SELECT CAST(COUNT(articles.article_id) AS INT) FROM articles`
  let queryString = `SELECT articles.article_id,articles.author, articles.title, articles.topic, TO_CHAR(articles.created_at,'YYYY-MM-DD HH24:MI:SS') created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INT) comment_count 
  FROM articles
  LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id 
  ORDER BY articles.${sortBy} ${order}`

  const countQueryVals = []
  const queryVals = []
  if (topic) {
    queryString =
      `SELECT * FROM (` +
      queryString +
      `) a 
    WHERE topic = $1`
    queryVals.push(topic)
    countQueryString += ` WHERE topic = $1`
    countQueryVals.push(topic)
  }
  const listPos = p - 1
  const offset = listPos * limit
  if (offset >= 0) {
    queryVals.push(limit)
    queryString += ` LIMIT $${queryVals.length}`
    queryVals.push(offset)
    queryString += ` OFFSET $${queryVals.length}`
  }
  return Promise.all([
    db.query(countQueryString, countQueryVals),
    db.query(queryString, queryVals),
  ]).then((fulfilledPromises) => {
    const { count } = fulfilledPromises[0].rows[0]
    const { rows } = fulfilledPromises[1]
    return { total_count: count, articles: rows }
  })
}

exports.selectArticleyById = (id) => {
  const baseString = `
  SELECT articles.*, TO_CHAR(articles.created_at,'YYYY-MM-DD HH24:MI:SS') created_at, CAST(COUNT(comment_id) AS INT) comment_count 
  FROM articles
  LEFT OUTER JOIN comments 
  ON articles.article_id = comments.article_id
  GROUP BY articles.article_id`
  const queryString =
    `SELECT * FROM (` +
    baseString +
    `) a 
  WHERE article_id = $1`
  const queryVals = [id]
  return db.query(queryString, queryVals).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({
        status: 404,
        customErrMsg: 'requested ID not found',
      })
    }
    return rows[0]
  })
}

exports.updateArticleById = (article_id, body) => {
  const { inc_votes } = body
  if (!inc_votes || typeof inc_votes !== 'number') {
    return Promise.reject({
      status: 400,
      customErrMsg: 'invalid vote increment supplied',
    })
  }
  return db
    .query(
      `UPDATE articles
  SET votes = votes + $1
  WHERE article_id = $2 
  RETURNING articles.*, TO_CHAR(articles.created_at,'YYYY-MM-DD HH24:MI:SS') created_at;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0]
    })
}

exports.insertArticle = (suppliedBody) => {
  const { author, title, body, topic } = suppliedBody
  return db
    .query(
      `INSERT INTO articles (author,title,body,topic)
  VALUES ($1, $2, $3, $4) 
  RETURNING articles.*, TO_CHAR(articles.created_at,'YYYY-MM-DD HH24:MI:SS') created_at;`,
      [author, title, body, topic]
    )
    .then(({ rows }) => {
      return rows[0].article_id
    })
}
