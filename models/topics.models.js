const db = require('../db/connection.js');

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`)
  .then(({rows}) => {
    return rows
  })
}

exports.selectTopicsBySlug = (topic) => {
  return db.query(`SELECT * FROM topics
  WHERE slug = $1`,[topic])
  .then(({rows}) => {
    if (rows.length === 0) {
      return Promise.reject({status:404,customErrMsg:'topic does not exist in database'})
    }
    return rows
  })
}

exports.insertTopic = (body) => {
  const {slug,description} = body
  return db.query(`INSERT INTO topics (slug,description)
  VALUES ($1, $2) 
  RETURNING *`,[slug,description])
  .then(({rows}) => {
    return rows[0]
  })

}