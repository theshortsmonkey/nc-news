exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.customErrMsg) {
    return res.status(err.status).send({ msg: err.customErrMsg })
  }
  next(err)
}

exports.handlePsqlErrors = (err, req, res, next) => {
  switch (err.code) {
    case '22P02':
      return res.status(400).send({ msg: 'invalid id supplied' })
    case '23502':
      return res.status(400).send({ msg: 'body missing required field' })
    case '23503':
      if (err.constraint === 'comments_author_fkey') {
        return res.status(404).send({msg: 'supplied username does not exist in database'})
      }
      return res.status(404).send({ msg: 'requested ID not found' })
    default:
      next(err)
  }
}

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err, '<--- in server error controller')
  return res.status(500).send({ msg: 'internal error' })
}
