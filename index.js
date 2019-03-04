var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
var Redis = require("ioredis");
const path = require('path');
var Log = require('./api/models/PrintLog');
var RedisWebManagerRoutes = require('./api/routes/RedisWebManagerRoutes');

const isPrintOnConsole = true;
module.exports.isPrintOnConsole = isPrintOnConsole;

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());  
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

/**To route all APIs requestes at right controller and its method */
RedisWebManagerRoutes(app);

/**
 * Start an redis web manager app at port localhost:3000
 */
var server = app.listen(3000,'0.0.0.0', function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Redis Web Manager RESTful API listening at http://localhost:%s", host, port)
	//var redisObj = new Redis('6379','localhost');
    /*redisObj.getBuiltinCommands().forEach(function(command){
		console.log(command);
	});*/
 });

/**
 * Print Connection details on console.
 */
 app.use(function(req, res) {
	 var printObj = new Log(req);
	 if(isPrintOnConsole)
		printObj.print();
	 res.status(404).send({url: req.originalUrl + ' not found'})
  });