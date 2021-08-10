const BlogModel = require('./blog')
const UserModel = require('./user')
const EntryModel = require('./entry')

module.exports = {
  models: {
    User: UserModel(),
    Blog: BlogModel(),
    Entry: EntryModel(),
  },
}
