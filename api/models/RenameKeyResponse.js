var renameResponse = function (key) {
    this.key = key;

    return this;
}

renameResponse.prototype.get = function (name) {
    return this[name];
}
    
renameResponse.prototype.set = function (name, value) {
    this[name] = value;
}

module.exports = renameResponse;
    