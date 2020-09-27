const { buildSchema } = require('graphql');
const {  fetchMessages } = require('./db');

const schema = buildSchema(`
    type Message {
      message: String!
      source: String!
      orderid: String!
      productname: String!
      price: String!
      createddate: String!
      owner: String!
      quantity: String!
      billingaddress: String!
      shippingaddress: String!
      status: String!

      
  }

  type Query {
    messages: [Message]    
  }
`);

const rootValue = {
    messages: fetchMessages
};

module.exports = {
  schema,
  rootValue
};