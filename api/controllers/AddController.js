var RedisConnect = require("../models/RedisConnect");
var AddResponse = require("../models/AddResponse");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.addKey = function(req, res) {
    var redisObj = new RedisConnect(req);
    var addKeydata = req.body;
    var keyType = addKeydata.keyType;
    var key = addKeydata.key;
    var singleValue = addKeydata.singleValue;
    var internalKey = addKeydata.internalKey;
    var internalScore = addKeydata.internalScore;
    var internalValue = addKeydata.internalValue;
    var addKeyResponse = new AddResponse(key);
        switch(keyType){
            case 'string':
                redisObj.set(key,singleValue,function(err,value){
                    sendAddKeyResponse(addKeyResponse,res,err,value);
                });
            break;
            case 'hash':
                redisObj.hset(key,internalKey,internalValue,function(err,value){
                    sendAddKeyResponse(addKeyResponse,res,err,value);
                });
            break;
            case 'set':
                redisObj.sadd(key,singleValue,function(err,value){
                    sendAddKeyResponse(addKeyResponse,res,err,value);
                });
            break;
            case 'list':
                redisObj.lpush(key,singleValue,function(err,value){
                    sendAddKeyResponse(addKeyResponse,res,err,value);
                });
            break;
            case 'zset':
                redisObj.zadd(key,internalScore,internalValue,function(err,value){
                    sendAddKeyResponse(addKeyResponse,res,err,value);
                });
            break;
            case 'none':
                addKeyResponse.err = 'Key is not available';
                res.send(addKeyResponse);
            break;
            default:
                addKeyResponse.err = 'Key type is invalid';
                res.send(addKeyResponse);
            break;
        };
};

function sendAddKeyResponse(addKeyResponseObj,resObj,err,value){
    if (err)
        addKeyResponseObj.err = "Error adding key";
    else
        addKeyResponseObj.message = "Key added or updated successfully";
    resObj.send(addKeyResponseObj);
    if(isPrintOnConsole){
        console.log("Response Sent For AddKeyRequest : ");
        console.log(addKeyResponseObj);
    }
}

exports.addRow = function(req, res) {
    var redisObj = new RedisConnect(req);
    var addRowdata = req.body;
    var keyType = addRowdata.keyType;
    var key = addRowdata.key;
    var singleValue = addRowdata.singleValue;
    var internalKey = addRowdata.internalKey;
    var internalScore = addRowdata.internalScore;
    var internalValue = addRowdata.internalValue;
    var addRowResponse = new AddResponse(key);
        switch(keyType){
            case 'hash':
                redisObj.hset(key,internalKey,internalValue,function(err,value){
                    sendAddRowResponse(addRowResponse,res,err,value);
                });
            break;
            case 'set':
                redisObj.sadd(key,singleValue,function(err,value){
                    sendAddRowResponse(addRowResponse,res,err,value);
                });
            break;
            case 'list':
                redisObj.lpush(key,singleValue,function(err,value){
                    sendAddRowResponse(addRowResponse,res,err,value);
                });
            break;
            case 'zset':
                redisObj.zadd(key,internalScore,internalValue,function(err,value){
                    sendAddRowResponse(addRowResponse,res,err,value);
                });
            break;
            case 'none':
                addKeyResponse.err = 'Key is not available';
                res.send(addKeyResponse);
            break;
            default:
                addKeyResponse.err = 'Key type is invalid';
                res.send(addKeyResponse);
            break;
        };
};

function sendAddRowResponse(addRowResponseObj,resObj,err,value){
    if (err)
        addRowResponseObj.err = "Error adding row";
    else
        addRowResponseObj.message = "Row added or updated successfully";
    resObj.send(addRowResponseObj);
    if(isPrintOnConsole){
        console.log("Response Sent For AddRowRequest : ");
        console.log(addRowResponseObj);
    }
}