exports.handleCustomErrors = (err,req,res,next) => {
  if (err.status && err.customErrMsg) {
    return res.status(err.status).send({msg:err.customErrMsg})
  }
  next(err)
}

exports.handlePsqlErrors = (err,req,res,next) => {
  if (err.code === '22P02') {
    return res.status(400).send({msg:'invalid id supplied'})
  }
  next(err)
}

exports.handleServerErrors = (err,req,res,next) => {
  console.log(err,'<--- in server error controller')
  return res.status(500).send({msg:'internal error'})
}