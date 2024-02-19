const db = require('../db/connection.js')

exports.selectArticles = () => {
  return db.query(`SELECT articles.article_id,articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INT) comment_count FROM articles
  LEFT OUTER JOIN comments ON articles.article_id = comments.article_id
  GROUP By articles.article_id
  ORDER BY articles.created_at DESC;`)
  .then(({rows}) => {
    return rows
  })
}

exports.selectArticleyById = (id) => {
  return db.query(`SELECT * FROM articles
  WHERE article_id = $1`,[id])
  .then(({rows}) => {
    if (!rows.length) {
      return Promise.reject({status:404,customErrMsg:'requested ID not found'})
    }
    return rows[0]
  })
}

exports.selectCommentsByArticleId = (id) => {
  return db.query(`SELECT * FROM comments
  WHERE article_id = $1;`,[id])
  .then(({rows}) => {
    return rows
  })
}