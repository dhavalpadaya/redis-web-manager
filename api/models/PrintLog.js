var Log = function (req) {
    this.headers = req.headers;
    this.hostname = req.hostname;
    this.originalUrl = req.originalUrl;
    this.body = req.body;
    this.currentDate = new Date();
};

Log.prototype.print = function(){
    console.log("Time : "+this.currentDate);
    console.log(this.hostname+" requested to url "+this.originalUrl+".");
    console.log("Headers : ");
    console.log(this.headers);
}

Log.prototype.setResponse = function (data) {
    this.response = data;
}

module.exports = Log;