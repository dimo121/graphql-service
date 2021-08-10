const { gql } = require('apollo-server')

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: String!
    email: String!
    password: String!
    tokens: String
    entries: [Entry]
    blogs: [Blog]
  }

  type Blog {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    user: ID!
    entries: [Entry]!
    owner: User
  }

  type Entry {
    id: ID!
    title: String!
    content: String!
    createdAt: String!
    blog_id: ID!
    user: ID!
    parent_blog: Blog
    owner: User
  }

  input UserInput {
    username: String
    email: String
    password: String
  }

  input BlogInput {
    title: String
    content: String
    createdAt: String
  }

  input EntryInput {
    title: String
    content: String
    createdAt: String
  }

  input AuthInput {
    email: String!
    password: String!
  }

  type Query {
    user(id: ID!): User!
    users(input: UserInput): [User]!
    blog(id: ID!): Blog!
    blogs(input: BlogInput, first: Int): [Blog]!
    blogsByUser(id: ID!): [Blog]!
    entry(id: ID!): Entry!
    entries(input: EntryInput): [Entry]!
  }

  input NewUserInput {
    username: String!
    email: String!
    password: String!
  }

  input NewBlogInput {
    title: String!
    content: String!
  }

  input NewEntryInput {
    title: String!
    content: String!
    blog_id: ID!
  }

  type Mutation {
    createUser(input: NewUserInput!): User!
    createBlog(input: NewBlogInput!): Blog!
    createEntry(input: NewEntryInput!): Entry!
    deleteBlog(id: String!): Blog!
    deleteEntry(id: String!): Entry!
    deleteUser(id: String!): User!
    login(input: AuthInput!): User
  }
`

module.exports = typeDefs
