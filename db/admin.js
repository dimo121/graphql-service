const { dynamo, docClient } = require('./dynamo')

const deleteTable = (TableName) => {
  const params = {
    TableName,
  }

  dynamo.deleteTable(params, (err, res) => {
    if (err) {
      console.log('Unable to deleted table : ', JSON.stringify(err, null, 2))
    } else {
      console.log(
        'Table deleted, description JSON : ',
        JSON.stringify(res, null, 2),
      )
    }
  })
}

const scanTable = (TableName) => {
  const params = {
    TableName,
  }

  docClient.scan(params, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log(data)
    }
  })
}

const createTableGSI = async (TableName, secondary) => {
  const params = {
    TableName: TableName,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: secondary,
        AttributeType: 'S',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: `${secondary}Index`,
        KeySchema: [
          {
            AttributeName: secondary,
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  }

  await dynamo.createTable(params, (err, res) => {
    if (err) {
      console.log('Unable to create table : ', JSON.stringify(err, null, 2))
    } else {
      console.log(
        'Table created, description JSON : ',
        JSON.stringify(res, null, 2),
      )
    }
  })
}

const createTable2GSI = async (TableName, secondary, tertiary) => {
  const params = {
    TableName: TableName,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: secondary,
        AttributeType: 'S',
      },
      {
        AttributeName: tertiary,
        AttributeType: 'S',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: `${secondary}Index`,
        KeySchema: [
          {
            AttributeName: secondary,
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      },
      {
        IndexName: `${tertiary}Index`,
        KeySchema: [
          {
            AttributeName: tertiary,
            KeyType: 'HASH',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 10,
          WriteCapacityUnits: 10,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  }

  await dynamo.createTable(params, (err, res) => {
    if (err) {
      console.log('Unable to create table : ', JSON.stringify(err, null, 2))
    } else {
      console.log(
        'Table created, description JSON : ',
        JSON.stringify(res, null, 2),
      )
    }
  })
}

// createTableGSI("MyblogUsers", "email")

// createTableGSI("Myblog", "user")

// createTable2GSI("Myenrties", "blog_id", "user")

scanTable('Myentries')

//deleteTable("Myentries")

