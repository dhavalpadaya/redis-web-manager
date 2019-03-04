var addResponse = function (key) {
    this.key = key;

    return this;
}

addResponse.prototype.get = function (name) {
    return this[name];
}
    
addResponse.prototype.set = function (name, value) {
    this[name] = value;
}

module.exports = addResponse;
    