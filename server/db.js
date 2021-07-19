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
          shippingaddress: row.billingaddress,
          status: row.status
      };
  });
};

const fetchMessages = () => {
  const selectMessages = `
      SELECT orderid, productname, source,price,quantity,status,createddate,orderowner, shippingaddress, billingaddress
      FROM orders order by  orderid desc
  `;
  
  // Prevent SQL injection using parametrized queries
  return pool.connect()
      .then((client) => {
        	console.log("connected");
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

  var qty = parseInt(msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.TARGET_QTY) || 0;
  var businessAddress = msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.BILLING_ADDR || 'NA';
  var shippingAddress = msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.SHIPPING_ADDR || 'NA';
  var createdDate =  msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.ORDER_START || 'NA';
  var owner =  msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.OWNER || 'NA';

  //const insertMsg = `Insert into rabbit_queue values ('${msg.message.orderId}', '${msg.source}')`;

  const insertMsg = `Insert into orders (orderId, productName, price,quantity, status,billingAddress,shippingAddress,createddate,orderowner,  source) 
                      values ('${msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.ITM_NUMBER}','${msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.MATERIAL}','${msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.COST}'
                      ,'${qty}','${msg.BAPI_SALESORDER_CREATEFROMDAT2.tables.ORDER_ITEMS_IN.STATUS}','${businessAddress}','${shippingAddress}' ,'${createdDate}' ,'${owner}' , '${msg.source}')`;

return pool.connect()
      .then((client) => {
        client.query(insertMsg).then((res) => {
          client.release();
			
				});
      });
};


const createTable = ()=>{
  console.log('attempting to create table');
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
        console.log('console created');
        client.query(checkTableExists).then((res) => {
          console.log('checked table exists' + res);
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
