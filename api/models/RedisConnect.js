/**
 * This model is used to connect to redis on given host and port
 */
var Redis = require("ioredis");

var RedisConnect = function (req) {
    var data = req.body;
    if(data.host == "localhost")
        this.host = req.connection.remoteAddress;
    this.host = data.host;
    this.port = data.port;
    var optionObj = new Object();
    optionObj.db = data.db;
    if(data.password != undefined || data.password != '')
        optionObj.password = data.password;
    this.options = optionObj;
    var redisObj = new Redis(this.port,this.host,this.options);
    redisObj.on('error', function (error) {
        redisObj.disconnect();
        redisObj.isError = true;
        return redisObj;
    });
    return redisObj;
}

RedisConnect.prototype.get = function (name) {
    return this[name];
}
    
RedisConnect.prototype.set = function (name, value) {
    this[name] = value;
}

module.exports = RedisConnect;
    