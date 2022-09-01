export const url = "https://randomuser.me/api/";
export const table = "[dbo].[user_table]";
export const config = {
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
