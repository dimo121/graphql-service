const AWS = require('aws-sdk')
const config = require('../config/config')

AWS.config.update({
  region: 'ap-southeast-2',
  endpoint: config.dynamoUri,
  accessKeyId: config.accessKey,
  secretAccessKey: config.secretKey,
})

const docClient = new AWS.DynamoDB.DocumentClient()

const dynamo = new AWS.DynamoDB()

module.exports = { docClient, dynamo }
