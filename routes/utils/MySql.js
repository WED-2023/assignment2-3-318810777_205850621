const mysql = require("mysql");
require("dotenv").config();

const config = {
  connectionLimit: 4,
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
};

const pool = mysql.createPool(config);

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection from pool:", err);
        return reject(err);
      }
      console.log("MySQL pool connected: threadId " + connection.threadId);

      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) {
              console.error("Error executing query:", err);
              return reject(err);
            }
            resolve(result);
          });
        });
      };

      const release = () => {
        return new Promise((resolve, reject) => {
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };

      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) {
        console.error("Error executing pool query:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { pool, connection, query };
