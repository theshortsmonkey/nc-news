const db = require('../db/connection.js')

exports.selectArticles = (topic) => {
  let queryString = `SELECT articles.article_id,articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INT) comment_count FROM articles
  LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`
  const queryVals = []
  if (topic) {
    queryString = `SELECT * FROM (` + queryString + `) a 
    WHERE topic = $1`
    queryVals.push(topic)
  }
  return db.query(queryString, queryVals).then(({ rows }) => {
    return rows
  })
}

exports.selectArticleyById = (id) => {
  return db
    .query(
      `SELECT * FROM articles
  WHERE article_id = $1`,
      [id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({
          status: 404,
          customErrMsg: 'requested ID not found',
        })
      }
      return rows[0]
    })
}

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments
  WHERE article_id = $1
  ORDER BY comments.created_at DESC;`,
      [id]
    )
    .then(({ rows }) => {
      return rows
    })
}

exports.insertCommentByArticleId = (article_id, comment) => {
  const { username, body } = comment
  return db
    .query(
      `INSERT INTO comments (author,body,article_id)
  VALUES ($1, $2,$3) RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
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
  WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0]
    })
}
