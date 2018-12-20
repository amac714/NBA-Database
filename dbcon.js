var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_macabuha',
  password        : '3547',
  database        : 'cs340_macabuha'
});

module.exports.pool = pool;
