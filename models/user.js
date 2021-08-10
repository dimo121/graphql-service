const { nanoid } = require('nanoid')
const { dynamo, docClient } = require('../db/dynamo')
const bcrypt = require('bcrypt')
const { jwtSecret } = require('../config/config')
const jwt = require('jsonwebtoken')

const UserModel = () => {
  return {
    async findOne(id) {
      const params = {
        ProjectionExpression: 'id, username, email, createdAt',
        TableName: 'MyblogUsers',
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
      data.Item.username = data.Item.username.S
      data.Item.email = data.Item.email.S

      return data.Item
    },
    async findMany(filter) {
      const params = {
        ProjectionExpression: 'id, createdAt, username, email',
        TableName: 'MyblogUsers',
      }

      let data

      try {
        data = await docClient.scan(params).promise()
      } catch (err) {
        console.log(err)
      }

      if (filter) {
        if (filter.username) {
          data.Items = data.Items.filter(
            (item) => item.username === filter.username,
          )
        }
        if (filter.email) {
          data.Items = data.Items.filter((item) => item.email === filter.email)
        }
      }

      return data.Items
    },
    async findLogin({ email, password }) {
      let params = {
        TableName: 'MyblogUsers',
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': email },
        ProjectionExpression: 'id, username, password, email, createdAt',
      }

      let user = await docClient.query(params).promise()

      if (user.Count === 0) {
        throw new Error('Error 404 - User email does not exist')
      }

      user = user.Items[0]

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        throw new Error('Error 403 - Incorrect email and password combination')
      }

      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' })

      params = {
        TableName: 'MyblogUsers',
        Key: {
          id: user.id,
        },
        UpdateExpression: 'set tokens = :token',
        ExpressionAttributeValues: { ':token': token },
        ReturnValues: 'ALL_NEW',
      }

      let result

      await docClient
        .update(params, (err, data) => {
          if (err) {
            console.log('Error 500 -', err)
          } else {
            //console.log(data)
            result = data
          }
        })
        .promise()

      return result.Attributes
    },
    async createUser(input) {
      let params = {
        TableName: 'MyblogUsers',
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': input.email },
        ProjectionExpression: 'id, username, password, email, createdAt',
      }

      let user = await docClient.query(params).promise()

      if (user.Count > 0) {
        throw new Error('Email already exists')
      }

      const date = new Date()

      const id = nanoid()

      input.password = await bcrypt.hash(input.password, 10)

      const token = jwt.sign({ email: input.email }, jwtSecret, {
        expiresIn: '24h',
      })

      params = {
        TableName: 'MyblogUsers',
        Key: {
          id,
        },
        UpdateExpression:
          'SET createdAt = :createdAt, username = :username, email = :email, password = :password, tokens = :tokens',
        ExpressionAttributeValues: {
          ':createdAt': date.toLocaleString(),
          ':username': input.username,
          ':email': input.email,
          ':password': input.password,
          ':tokens': token,
        },
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
    async deleteUser(id) {
      const params = {
        TableName: 'MyblogUsers',
        Key: {
          id: {
            S: id,
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
            if (!data['ConsumedCapacity']) {
              console.log(
                'Item deleted succesfully: ',
                JSON.stringify(data, null, 2),
              )
              //reformatting dynamo response element
              result.id = data.Attributes.id.S
            } else {
              console.log('Item does not exist')
            }
          }
        })
        .promise()

      return result
    },
  }
}

module.exports = UserModel

/*
    
*/
