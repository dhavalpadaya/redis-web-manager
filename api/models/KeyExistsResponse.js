var KeyExistsResponse = function (isExists) {
    this.isExists = isExists;

    return this;
}

KeyExistsResponse.prototype.get = function (name) {
    return this[name];
}
    
KeyExistsResponse.prototype.set = function (name, value) {
    this[name] = value;
}

module.exports = KeyExistsResponse;
    