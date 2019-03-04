var GetKeyResponse = function (keyType,key) {
    this.keyType = keyType;
    this.key = key;

    return this;
}

GetKeyResponse.prototype.get = function (name) {
    return this[name];
}
    
GetKeyResponse.prototype.set = function (name, value) {
    this[name] = value;
}

module.exports = GetKeyResponse;
    