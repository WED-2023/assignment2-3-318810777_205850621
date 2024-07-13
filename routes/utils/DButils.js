require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (sql, params) {
  let returnValue = [];
  const connection = await MySql.connection();
  try {
    await connection.query("START TRANSACTION");
    returnValue = await connection.query(sql, params);
    await connection.query("COMMIT");
  } catch (err) {
    await connection.query("ROLLBACK");
    console.log("ROLLBACK at execQuery", err);
    throw err;
  } finally {
    await connection.release();
  }
  return returnValue;
};
