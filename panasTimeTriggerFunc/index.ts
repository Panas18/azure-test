import { AzureFunction, Context } from "@azure/functions";
import axios from "axios";
import { Connection, Request, TYPES } from "tedious";
import { User } from "./domain/User";
import { url, table, config } from "./constants";

const timerTrigger: AzureFunction = async function(context: Context, myTimer: any) {
  if (myTimer.isPastDue) {
    context.log("Timer function is running late!");
  }

  // response from URL
  const response = await axios.get(url);
  const connection = new Connection(config);

  // connect to the database
  connection.connect(err => {
    if (err) {
      context.log(err);
      throw err;
    }

    const user = parseResponse(response);

    // sql query to insert user fetched from the api
    const request = new Request(
      `INSERT INTO ${table} (first_name ,last_name ,city ,state ,country ,email ,age ,fetched_date, fetched_time) values 
      (@first_name, @last_name, @city, @state, @country, @email, @age,  @fetched_date, @fetched_time)`,
      (err, rowCount, rows) => {
        if (err) {
          context.log(err);
          throw err;
        }
      }
    );
    request.addParameter("first_name", TYPES.VarChar, user.first_name);
    request.addParameter("last_name", TYPES.VarChar, user.last_name);
    request.addParameter("age", TYPES.Numeric, user.age);
    request.addParameter("city", TYPES.VarChar, user.city);
    request.addParameter("country", TYPES.VarChar, user.country);
    request.addParameter("email", TYPES.VarChar, user.email);
    request.addParameter("state", TYPES.VarChar, user.state);
    request.addParameter("fetched_date", TYPES.Date, user.fetched_date);
    request.addParameter("fetched_time", TYPES.VarChar, user.fetched_time);

    connection.execSql(request);
  });
};

/**
 * parse the response and extract User
 * @param response
 * @returns User
 */
function parseResponse(response): User {
  const dateTime: string[] = new Date()
    .toLocaleString([], {
      timeZone: "Asia/Kathmandu",
      hourCycle: "h23"
    })
    .split(" ");
  const date = dateTime[0];
  const time = dateTime[1];
  const result = response.data.results[0];
  const user: User = {
    first_name: result.name.first,
    last_name: result.name.last,
    age: result.dob.age,
    city: result.location.city,
    country: result.location.country,
    email: result.email,
    state: result.location.state,
    fetched_date: date,
    fetched_time: time
  };

  return user;
}

export default timerTrigger;
