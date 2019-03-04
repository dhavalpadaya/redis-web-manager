var RedisConnect = require("../models/RedisConnect");
var GetKeyResponse = require("../models/GetKeyResponse");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.getKey = function(req, res) {
    var redisObj = new RedisConnect(req);
    var key = req.params.key;
    var typeOfKey = redisObj.type(key).then(function(typeOfKey){
        var getKeyResponse = new GetKeyResponse(typeOfKey,key);
        switch(typeOfKey){
            case 'string':
            	redisObj.get(key,function(err,value){
                    sendGetKeyResponse(getKeyResponse,res,err,value);
                });
            break;
            case 'hash':
            	redisObj.hgetall(key,function(err,value){
                    sendGetKeyResponse(getKeyResponse,res,err,value);
                });
            break;
            case 'set':
                redisObj.smembers(key,function(err,value){
                    sendGetKeyResponse(getKeyResponse,res,err,value);
                });
            break;
            case 'list':
                redisObj.llen(key,function(err,size){
                    redisObj.lrange(key,0,(size-1),function(err,value){
                        sendGetKeyResponse(getKeyResponse,res,err,value);
                    })
                });
            break;
            case 'zset':
                redisObj.zcard(key,function(err,size){
                    redisObj.zrange(key,0,(size-1),"WITHSCORES",function(err,value){
                        sendGetKeyResponse(getKeyResponse,res,err,value);
                    })
                });
            break;
            case 'none':
                getKeyResponse.err = 'Key is not available';
                res.send(getKeyResponse);
            break;
            default:
                getKeyResponse.err = 'Key type is invalid';
                res.send(getKeyResponse);
            break;
        };
    });
};

function sendGetKeyResponse(getKeyResponseObj,resObj,err,value){
                        if (err)
                            getKeyResponseObj.err = err;
                        getKeyResponseObj.set("value",value);
                        resObj.send(getKeyResponseObj);
						if(isPrintOnConsole){
							console.log("Response Sent For GetKeyRequest : ");
							console.log(getKeyResponseObj);
						}
}