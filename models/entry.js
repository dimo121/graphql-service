const { nanoid } = require('nanoid')
const { dynamo, docClient } = require('../db/dynamo')

const EntryModel = () => {
  return {
    async findOne(id) {
      const params = {
        ProjectionExpression: 'id, title, content, createdAt, blog_id',
        TableName: 'Myentries',
        Key: {
          id: {
            S: id,
          },
        },
      }
      let data

      try {
        data = await dynamo.getItem(params).promise()
      } catch (err) {
        console.log(err)
      }

      //reformatting dynamodb return element
      data.Item.id = data.Item.id.S
      data.Item.createdAt = data.Item.createdAt.S
      data.Item.title = data.Item.title.S
      data.Item.content = data.Item.content.S
      data.Item.blog_id = data.Item.blog_id.S

      return data.Item
    },
    async findMany() {
      const params = {
        TableName: 'Myentries',
      }

      let data

      try {
        data = await docClient.scan(params).promise()
      } catch (err) {
        console.log(err)
      }

      console.log(data.Items)

      return data.Items
    },
    async findByBlog(blog_id) {
      const params = {
        TableName: 'Myentries',
        IndexName: 'blog_idIndex',
        KeyConditionExpression: 'blog_id = :blog_id',
        ExpressionAttributeValues: { ':blog_id': blog_id },
        ProjectionExpression: 'id, title, content, createdAt, blog_id, #user',
        ExpressionAttributeNames: { '#user': 'user' },
      }

      let data

      try {
        data = await docClient.query(params).promise()
      } catch (err) {
        console.log(err)
      }

      return data.Items
    },
    async findByUser(id) {
      const params = {
        TableName: 'Myentries',
        IndexName: 'userIndex',
        KeyConditionExpression: '#user = :user_id',
        ExpressionAttributeNames: { '#user': 'user' },
        ExpressionAttributeValues: { ':user_id': id },
        ProjectionExpression: 'id, title, content, createdAt, blog_id, #user',
      }

      let data

      try {
        data = await docClient.query(params).promise()
      } catch (err) {
        console.log(err)
      }

      return data.Items
    },
    async createEntry(input) {
      const date = new Date()

      const id = nanoid()

      const params = {
        TableName: 'Myentries',
        Key: {
          id,
        },
        UpdateExpression:
          'SET createdAt = :createdAt, title = :title, content = :content, #user = :user, blog_id = :blog_id',
        ExpressionAttributeValues: {
          ':createdAt': date.toLocaleDateString('en-GB'),
          ':title': input.title,
          ':content': input.content,
          ':blog_id': input.blog_id,
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
    async deleteEntry(input) {
      console.log(input)
      let params = {
        ProjectionExpression: '#user',
        TableName: 'Myentries',
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
        throw new Error('Not authenticated to delete this entry')
      }

      params = {
        TableName: 'Myentries',
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

            if (data.hasOwnProperty('Attributes'))
              result.id = data.Attributes.id.S
          }
        })
        .promise()

      return result
    },
  }
}

module.exports = EntryModel

/*

    */
