const { nanoid } = require('nanoid')
const { dynamo, docClient } = require('../db/dynamo')

const BlogModel = () => {
  return {
    async findOne(id) {
      const params = {
        ProjectionExpression: 'id, createdAt, title, content, #user',
        TableName: 'Myblog',
        Key: {
          id: {
            S: id,
          },
        },
        ExpressionAttributeNames: { '#user': 'user' },
      }
      let data

      try {
        data = await dynamo.getItem(params).promise()
      } catch (err) {
        console.log(err)
      }

      //reformatting dynamodb return element
      if (!data.Item) {
        throw new Error('500 - Blog not found')
      }
      data.Item.id = data.Item.id.S
      data.Item.createdAt = data.Item.createdAt.S
      data.Item.title = data.Item.title.S
      data.Item.content = data.Item.content.S
      data.Item.user = data.Item.user.S

      return data.Item
    },
    async findByUser(id) {
      const params = {
        TableName: 'Myblog',
        IndexName: 'userIndex',
        KeyConditionExpression: '#user = :user_id',
        ExpressionAttributeNames: { '#user': 'user' },
        ExpressionAttributeValues: { ':user_id': id },
        ProjectionExpression: 'id, title, content, createdAt, #user',
      }

      let data

      try {
        data = await docClient.query(params).promise()
      } catch (err) {
        console.log(err)
      }

      return data.Items
    },
    async findMany() {
      const params = {
        TableName: 'Myblog',
        Limit: 20,
      }

      let data

      try {
        data = await docClient.scan(params).promise()
      } catch (err) {
        console.log(err)
      }

      console.log(data)

      return data.Items
    },
    async createBlog(input) {
      const date = new Date()

      const id = nanoid()

      const params = {
        TableName: 'Myblog',
        Key: {
          id,
        },
        UpdateExpression:
          'SET createdAt = :createdAt, title = :title, content = :content, #user = :user',
        ExpressionAttributeValues: {
          ':createdAt': date.toLocaleDateString('en-GB'),
          ':title': input.title,
          ':content': input.content,
          ':user': input.user,
        },
        ExpressionAttributeNames: { '#user': 'user' },
        ReturnValues: 'ALL_NEW',
      }

      let result

      try {
        await docClient
          .update(params, (err, data) => {
            if (err) {
              console.log('Unable to add item :', err)
              //check error return code
              return err
            } else {
              console.log('Item added succesfully.', data)
              result = data.Attributes
            }
          })
          .promise()
      } catch (e) {
        //check error return code
        console.log(e)
      }

      return result
    },
    async deleteBlog(input) {
      let params = {
        ProjectionExpression: '#user',
        TableName: 'Myblog',
        Key: {
          id: {
            S: input.id,
          },
        },
        ExpressionAttributeNames: { '#user': 'user' },
      }

      let data

      try {
        data = await dynamo.getItem(params).promise()
      } catch (err) {
        console.log(err)
      }

      if (data.Item.user.S !== input.user) {
        throw new Error('Not authenticated to delete this blog')
      }

      params = {
        TableName: 'Myblog',
        Key: {
          id: {
            S: input.id,
          },
        },
        ReturnValues: 'ALL_OLD',
      }

      let result = { id: '' }

      await dynamo
        .deleteItem(params, (err, data) => {
          if (err) {
            console.log('Unable to delete item: ', JSON.stringify(err, null, 2))
          } else {
            console.log(
              'Item deleted succesfully: ',
              JSON.stringify(data, null, 2),
            )
            //dynamo response reformatting
            console.log(data)
            if (data.hasOwnProperty('Attributes'))
              result.id = data.Attributes.id.S
          }
        })
        .promise()

      params = {
        TableName: 'Myentries',
        IndexName: 'blog_idIndex',
        KeyConditionExpression: 'blog_id = :blog_id',
        ExpressionAttributeValues: { ':blog_id': result.id },
        ProjectionExpression: 'id',
      }

      try {
        data = await docClient.query(params).promise()
      } catch (err) {
        console.log(err)
      }

      console.log('Entry data, ', data)

      if (data.Items) {
        data.Items.forEach(async (item) => {
          params = {
            TableName: 'Myentries',
            Key: {
              id: {
                S: item.id,
              },
            },
            ReturnValues: 'ALL_OLD',
          }

          await dynamo
            .deleteItem(params, (err, data) => {
              if (err) {
                console.log(
                  'Unable to delete item: ',
                  JSON.stringify(err, null, 2),
                )
              } else {
                console.log(
                  'Item deleted succesfully: ',
                  JSON.stringify(data, null, 2),
                )
              }
            })
            .promise()
        })
      }

      return result
    },
  }
}

module.exports = BlogModel
