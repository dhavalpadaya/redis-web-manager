var RedisConnect = require("../models/RedisConnect");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.connect = function(req, res) {
    var redisObj = new RedisConnect(req);
    redisObj.on('error', function (error) {
        redisObj.disconnect();
		if(isPrintOnConsole){
			console.log("Disconnected");
			console.log("Error :- "+error)
		}
        res.send(error);        
    });
    redisObj.on("connect",function(){
		if(isPrintOnConsole)
			console.log("Connected");
        redisObj.keys("*",function(err,keys){
            if (err)
               res.send(err);
            res.send(keys);
        });
    })
};