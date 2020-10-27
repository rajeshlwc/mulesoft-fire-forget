const { Pool } = require('pg');
const assert = require('assert');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: {
      rejectUnauthorized: false,
    }
});

const constructQuery = (client, sql) => {
  return client.query(sql);
};

const parseMessages = (res) => {
  if (res.rowCount === 0) {
      return [];
  }
 assert(res);
  return res.rows.map((row) => {
      return {
          message: row.productname,
          source: row.source,
          orderid: row.orderid,
          productname: row.productname,
          price:row.price,
          createddate: row.createddate,
          owner:row.orderowner,
          quantity:row.quantity,
          billingaddress: row.billingaddress,
          shippingaddress: row.shippingaddress,
          status: row.status
      };
  });
};

const fetchMessages = () => {
  const selectMessages = `
      SELECT orderid, productname, source,price,quantity,status,createddate,orderowner, shippingaddress, billingaddress
      FROM orders order by  createddate desc
  `;
  
  // Prevent SQL injection using parametrized queries
  return pool.connect()
      .then((client) => {
        
          return constructQuery(client, selectMessages)
              .then((res) => {
                  client.release();

                  return parseMessages(res);
              })
              .catch((err) => {
                  client.release();
                  // eslint-disable-next-line no-console
                  console.error(err.stack);
              });
      });
};

const insertMessage = (message) => {

  console.log(message);

  var msg = JSON.parse(message);

  console.log(msg.source);
  console.log(msg.message);


  var qty = parseInt(msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.TARGET_QTY) || 0;
  var businessAddress = msg.message.BillingAddress || 'NA';
  var shippingAddress = msg.message.shippingAddress || 'NA';
  var createdDate =  msg.message.createdDate || 'NA';
  var owner =  msg.message.Owner || 'NA';

  //const insertMsg = `Insert into rabbit_queue values ('${msg.message.orderId}', '${msg.source}')`;

  const insertMsg = `Insert into orders (orderId, productName, price,quantity, status,billingAddress,shippingAddress,createddate,orderowner,  source) 
                      values ('${msg.message.orderId}','${msg.message.product}','${msg.message.price}'
                      ,'${qty}','${msg.message.Status}','${businessAddress}','${shippingAddress}' ,'${createdDate}' ,'${owner}' , '${msg.source}')`;

return pool.connect()
      .then((client) => {
        client.query(insertMsg).then((res) => {
          client.release();
			
				});
      });
};


const createTable = ()=>{

 const query = `CREATE TABLE Orders (
    orderid varchar,
    Productname varchar,
    description varchar,
    shippingaddress varchar,
    billingaddress varchar,
    orderowner varchar,
    price varchar,
    createddate varchar,
    status varchar,
    quantity int,
    source varchar
)`;

const checkTableExists = `SELECT
*
FROM
pg_catalog.pg_tables where tablename = 'orders'`;
console.log('Entered');
pool.connect()
      .then((client) => {
        client.query(checkTableExists).then((res) => {
          if (res.rows.length == 0) {
            pool.query(query).then((res) => {
              console.log("Table is successfully created");
             
            });
          }
				}).catch((err) => {
          console.error(err);
        })
        .finally(() => {
          //pool.end();
          client.release();
        });;
      });

}

module.exports = {
  fetchMessages,
  insertMessage,
  createTable
};