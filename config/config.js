const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'YOUR_secret_key',
  dynamoUri: 'http://localhost:8000',
  accessKey: 'randomKeyId',
  secretKey: 'secretKey',
}

module.exports = config
