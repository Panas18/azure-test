/**
 * Parse the rows from the request and extract request count, date and time
 * @param rows
 * @returns {string}
 */
function parseRequest(rows): string {
  let returnMessage: string = `Count   Date       Time`;
  rows.forEach(col => {
    const count: string = col[0].value as string;
    const date: string = col[1].value.split(",")[0];
    const time: string = col[1].value.split(",")[1];
    returnMessage = returnMessage.concat("\n", count, "    ", date, "   ", time);
  });

  return returnMessage;
}

export default parseRequest;
