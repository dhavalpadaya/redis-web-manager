module.exports = function(app) {
    /**
     * Import all required controllers
     */
    var connectController = require('../controllers/ConnectController');
    var getController = require('../controllers/GetController');
    var deleteController = require('../controllers/DeleteController');
    var addController = require('../controllers/AddController');
    var keyExistsController = require('../controllers/KeyExistsController');
    var renameKeyController = require('../controllers/RenameController');
  
    app.route('/rwm/connect')
      .post(connectController.connect);
  
     app.route('/rwm/get/:key')
       .post(getController.getKey);

       app.route('/rwm/delete/:key')
       .delete(deleteController.deleteKey);

       app.route('/rwm/deleteMultiple/:key')
       .delete(deleteController.deleteMultipleKey);

       app.route('/rwm/addKey')
       .post(addController.addKey);

       app.route('/rwm/addRow')
       .post(addController.addRow);

       app.route('/rwm/exists/:key')
       .post(keyExistsController.keyExists);

       app.route('/rwm/renameKey')
       .post(renameKeyController.renameKey);
  };