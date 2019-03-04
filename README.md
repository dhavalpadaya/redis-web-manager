# Redis Web Manager
Redis Web Manager is a web application to add, update , read or delete redis keys and values. This web application has been developed in Nodejs.

<img src="/public/img/redis-web-manager.png" alt="Screenshot of the example app"/>

Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone https://github.com/dhavalpadaya/redis-web-manager.git redis-web-manager

# Change directory
cd redis-web-manager

# Install NPM dependencies
npm install

# Then simply start your app
node index.js
```

**Note:** I highly recommend installing [Nodemon](https://github.com/remy/nodemon).
It watches for any changes in your  node.js app and automatically restarts the
server. Once installed, instead of `node index.js` use `nodemon index.js`. It will
save you a lot of time in the long run, because you won't need to manually
restart the server each time you make a small change in code. To install, run
`sudo npm install -g nodemon`.

