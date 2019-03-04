var RedisConnect = require("../models/RedisConnect");
var KeyExistsResponse = require("../models/KeyExistsResponse");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.keyExists = function(req, res) {
    var redisObj = new RedisConnect(req);
    var key = req.params.key;
    redisObj.exists(key,function(err,value){
        if(err == null){
            if(value == 1){
                keyExistsResponse = new KeyExistsResponse(true);
                keyExistsResponse.originalKey = key;
                redisObj.type(key).then(function(keyType){
                    keyExistsResponse.originalKeyType = keyType;
                    res.send(keyExistsResponse);
                    if(isPrintOnConsole){
                        console.log("Response Sent For KeyExistsRequest : ");
                        console.log(keyExistsResponse);
                    }
                });
            }
            else{
                keyExistsResponse = new KeyExistsResponse(false);
                keyExistsResponse.originalKey = key;
                res.send(keyExistsResponse);
                if(isPrintOnConsole){
                    console.log("Response Sent For KeyExistsRequest : ");
                    console.log(keyExistsResponse);
                }
            }
        }else{
            keyExistsResponse = new KeyExistsResponse(false);
            keyExistsResponse.originalKey = key;
            res.send(keyExistsResponse);
            if(isPrintOnConsole){
                console.log("Response Sent For KeyExistsRequest : ");
                console.log(keyExistsResponse);
            }
        }
    })
};