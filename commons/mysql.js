var mysql = require('mysql')
    Url = require('url');

var db = null;
var connectionData = {
    host     : 'dyud5fa2qycz1o3v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user     : 'dhnxby0jczrbxl66',
    password : 'hqee18nzwtoa528o',
    database : 'y9ilk3gpr68g9x1e',
    dateStrings: 'date'
};
var dbUrl = process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL;

if(dbUrl) {
  var mySqlUrl = Url.parse(dbUrl);
  var auth = mySqlUrl.auth.split(':');
  connectionData.host = mySqlUrl.hostname;
  connectionData.user = auth[0];
  connectionData.password = auth[1] || '';
  connectionData.database = mySqlUrl.pathname.substr(1);
  if(mySqlUrl.port) {
      connectionData.port = mySqlUrl.port;
  }
}

db = mysql.createConnection(connectionData);
db.connect();
module.exports = db;
