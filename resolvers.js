const { authenticated } = require('./config/auth')

module.exports = {
  Query: {
    user: (_, { id }, { models }) => {
      return models.User.findOne(id)
    },
    users: (_, { input }, { models }) => {
      return models.User.findMany(input)
    },
    blog: (_, { id }, { models }) => {
      return models.Blog.findOne(id)
    },
    blogs: (_, { input }, { models }) => {
      return models.Blog.findMany(input)
    },
    blogsByUser: (_, { id }, { models }) => {
      return models.Blog.findByUser(id)
    },
    entry: (_, { id }, { models }) => {
      return models.Entry.findOne(id)
    },
    entries: (_, { input }, { models }) => {
      return models.Entry.findMany(input)
    },
  },
  Mutation: {
    createUser: (_, { input }, { models }) => {
      return models.User.createUser({ ...input })
    },
    createBlog: authenticated((_, { input }, { models, user }) => {
      return models.Blog.createBlog({ ...input, user: user.id })
    }),
    createEntry: authenticated((_, { input }, { models, user }) => {
      return models.Entry.createEntry({ ...input, user: user.id })
    }),
    deleteUser: (_, { id }, { models, user }) => {
      return models.User.deleteUser(id)
    },
    deleteBlog: authenticated((_, { id }, { models, user }) => {
      return models.Blog.deleteBlog({ id, user: user.id })
    }),
    deleteEntry: authenticated((_, { id }, { models, user }) => {
      return models.Entry.deleteEntry({ id, user: user.id })
    }),
    login: (_, { input }, { models }) => {
      return models.User.findLogin(input)
    },
  },
  Blog: {
    owner: (blog, _, { models }) => {
      return models.User.findOne(blog.user)
    },
    entries(blog, _, { models }) {
      return models.Entry.findByBlog(blog.id)
    },
  },
  User: {
    blogs(user, _, { models }) {
      //field specific resolver, property not in type user
      return models.Blog.findByUser(user.id)
    },
    entries(user, _, { models }) {
      return models.Entry.findByUser(user.id)
    },
  },
  Entry: {
    owner: (entry, _, { models }) => {
      return models.User.findOne(entry.user)
    },
    parent_blog(entry, _, { models }) {
      return models.Blog.findOne(entry.blog_id)
    },
  },
}
