var RedisConnect = require("../models/RedisConnect");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.deleteKey = function(req, res) {
    var deleteKeyResponse = new Object();
    var redisObj = new RedisConnect(req);
    var key = req.params.key;
    deleteKeyResponse.key = key;
    redisObj.del(key,function(err,value){
        if (err)
        {
            deleteKeyResponse.err = err;
            deleteKeyResponse.isDeleted = false;
        }
        deleteKeyResponse.isDeleted = true;
        res.send(deleteKeyResponse);
		if(isPrintOnConsole){
			console.log("Response Sent : ");
			console.log(deleteKeyResponse);
		}
    });
};

exports.deleteMultipleKey = function(req, res) {
    var deleteMultipleKeyResponse = new Object();
    var redisObj = new RedisConnect(req);
    var key = req.params.key;
    var internalKeyArray = req.body.internalKeyArray;
    deleteMultipleKeyResponse.key = key;
    redisObj.type(key).then(function(typeOfKey){
        switch(typeOfKey){
            case 'string':
                deleteMultipleKeyResponse.err = 'String type keys does not have multiple keys';
                deleteMultipleKeyResponse.isDeleted = false;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            break;
            case 'hash':
            redisObj.hdel(key,internalKeyArray,function(err,value){
                deleteMultipleKeyResponse.noOfKeysDeleted = value;
                deleteMultipleKeyResponse.isDeleted = true;
                deleteMultipleKeyResponse.deletedKeys = internalKeyArray;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            });
            break;
            case 'set':
            redisObj.srem(key,internalKeyArray,function(err,value){
                deleteMultipleKeyResponse.noOfKeysDeleted = value;
                deleteMultipleKeyResponse.isDeleted = true;
                deleteMultipleKeyResponse.deletedKeys = internalKeyArray;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            });
            break;
            case 'list':
            var noOfKeysDeleted = 0;
            var deletedKeys = new Array();
            Promise.all(
                internalKeyArray.map(function(internalKey){
                    console.log(internalKey);
                    return new Promise(function(res){
                        redisObj.lrem(key,0,internalKey,function(err,value){
                            if(!err)
                                res(internalKey);
                        });                        
                       });
                })).then(function(internalKeys){
                            deleteMultipleKeyResponse.isDeleted = true;
                            deleteMultipleKeyResponse.noOfKeysDeleted = internalKeys.length;
                            deleteMultipleKeyResponse.deletedKeys = internalKeys;
                    sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
                });
            break;
            case 'zset':
            redisObj.zrem(key,internalKeyArray,function(err,value){
                deleteMultipleKeyResponse.isDeleted = true;
                deleteMultipleKeyResponse.deletedKeys = internalKeyArray;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            });
            break;
            case 'none':
                deleteMultipleKeyResponse.err = 'Key is not available';
                deleteMultipleKeyResponse.isDeleted = false;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            default:
                deleteMultipleKeyResponse.err = 'Key is not available';
                deleteMultipleKeyResponse.isDeleted = false;
                sendDeleteMultipleRespose(deleteMultipleKeyResponse,res);
            break;
        };
    });
};

function sendDeleteMultipleRespose(deleteMultipleKeyResponse,resObj)
{
    resObj.send(deleteMultipleKeyResponse);
	if(isPrintOnConsole){
		console.log("Response Sent for DeleteMultiple Key : ");
		console.log(deleteMultipleKeyResponse);;
	}
}