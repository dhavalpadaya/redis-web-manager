var RedisConnect = require("../models/RedisConnect");
var RenameKeyResponse = require("../models/RenameKeyResponse");
var indexFile = require("../../index");
var isPrintOnConsole = indexFile.isPrintOnConsole;

exports.renameKey = function(req, res) {
    var redisObj = new RedisConnect(req);
    var renameKeydata = req.body;
    var keyType = renameKeydata.keyType;
    var key = renameKeydata.key;
    var newKey = renameKeydata.newKey;
    var renameKeyResponse = new RenameKeyResponse(key);
    redisObj.rename(key,newKey,function(err,value){
        renameKeyResponse.newKey = newKey;
        sendRenameKeyResponse(renameKeyResponse,res,err);
    });
};

function sendRenameKeyResponse(renameKeyResponseObj,resObj,err){
    if (err)
        renameKeyResponseObj.err = "Some error occurred";
    else
        renameKeyResponseObj.message = "Key has been renamed successfully";
    resObj.send(renameKeyResponseObj);
    if(isPrintOnConsole){
        console.log("Response Sent For RenameKeyRequest : ");
        console.log(renameKeyResponseObj);
    }
}