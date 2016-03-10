var commandLineArgs = require('command-line-args');
var sql = require('mssql');

var host = 'THE-DB-HOST';
var user = 'THE-DB-USER';
var pwd = 'THE-PASSWORD';
var db = 'THE-DB';
 
var cli = commandLineArgs([
    { name: 'host', alias: 'h', type: String, defaultOption: host },
    { name: 'user', alias: 'u', type: String, defaultOption: user },
    { name: 'pwd', alias: 'p', type: String, defaultOption: pwd },
    { name: 'database', alias: 'd', type: String, defaultOption: db }
]);

var options = cli.parse();

// Unocomment when you need to debug
//console.log("options:\n" + JSON.stringify(options));

host = options.host;
user = options.user;
pwd = options.pwd;
db = options.database;

var connectString = "mssql://"+ user  +":"+ pwd + "@"+ host +"/"+ db;

// generic query to show existing database information:
var query = "SELECT * FROM master.dbo.sysdatabases;"; 

console.log("connectString is:\n" + connectString);
console.log("sql is:\n" + query);

sql.connect(connectString).then(function() {
    new sql.Request().query(query).then(function(recordset) {
	console.dir(recordset);
    }).catch(function(err) {
	console.log("Error during query() is:" + err);
    });
}).catch(function(err) {
    console.log("Error during connect() is:" + err);
});
