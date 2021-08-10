const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { models } = require('./models/index')
const { jwtSecret } = require('./config/config')
const jwt = require('jsonwebtoken')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    let user = null

    if (req.headers.authorization)
      try {
        const token = req.headers.authorization.replace('Bearer ', '')

        const decoded = jwt.verify(token, jwtSecret, (err, decoded) => {
          if (err) throw new Error('Invalid token')
          else return decoded
        })

        user = await models.User.findOne(decoded.id)
      } catch (e) {
        console.log('Error 401 - Unauthorized')
      }

    return { models, user }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
