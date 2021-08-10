const authenticated = (next) => (root, args, context, info) => {
  //console.log(context)
  if (!context.user) {
    throw new Error('Not authenticated')
  }
  return next(root, args, context)
}

module.exports = { authenticated }
