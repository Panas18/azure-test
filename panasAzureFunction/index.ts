import { AzureFunction, Context } from "@azure/functions";
import { Connection, Request, TYPES } from "tedious";
import parseRequest from "./utils";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * This function gets called everytime HTTP request [get] is made.
 * @param {Context}
 * @param {HttpRequest}
 */
const httpTrigger: AzureFunction = function(context: Context) {
  // configuration of  azure sql database
  const config = {
    authentication: {
      options: {
        userName: process.env.USER_NAME,
        password: process.env.PASSWORD
      },
      type: process.env.TYPE
    },
    server: process.env.SERVER,
    options: {
      database: process.env.DATABASE,
      encrypt: true,
      rowCollectionOnRequestCompletion: true
    }
  };
  // create a connection to database
  const connection = new Connection(config);
  connection.connect(err => {
    if (err) {
      console.log("Connection Failed");
      throw err;
    }

    setRequesetTime(connection, context);
  });
};

/**
 * Store request time and count to the database
 * @param {Connection}
 * @param {Context}
 */
function setRequesetTime(connection: Connection, context: Context) {
  const table: string = "[dbo].[request_count]";
  const time: string = new Date().toLocaleString([], {
    timeZone: "Asia/Kathmandu"
  });
  const request = new Request(`INSERT	INTO ${table} (date) values (@time)`, (err, rowCount, rows) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
  request.addParameter("time", TYPES.VarChar, time);
  request.on("requestCompleted", () => {
    getRequestTime(connection, context);
  });
  connection.execSql(request);
}

/**
 * Get request time and count from database
 * @param {Connection}
 * @param {Context}
 */
function getRequestTime(connection: Connection, context: Context) {
  let returnMessage: string;
  const request = new Request("SELECT * FROM request_count order by count", (err, rowCount, rows) => {
    if (err) {
      console.log(err);
      throw err;
    }
    returnMessage = parseRequest(rows);
  });

  request.on("requestCompleted", () => {
    context.res = {
      body: returnMessage
    };
    context.done();
  });
  connection.execSql(request);
}

export default httpTrigger;
