//'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: 'scenic-setup-231121'
});

// testing travis function deployment - take 3
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const kindName = 'Provider';

module.exports.getProviders = (req, res, done) => {

  debugger;

    return cors(req, res, () => {

     if (req.method == "GET") {

          // if provider description was provided in the querystring of a GET then return the provider record
          let desc = req.query.description || '';
          let query = datastore.createQuery('Provider');

          if (desc) {
            query.filter('description','=', desc.trim());
          }  

          datastore.runQuery(query).then(results => {

            const providers = results[0];
            var returnVal = [];
            /*
            returnVal.count = results[0].length;
            returnVal.matches = [];
            */

            var keys = [];
            providers.forEach(provider => {
              const providerKey = provider[datastore.KEY];
              keys.push(providerKey.id);
              provider.id = providerKey.id;
              returnVal.push(provider);
              // console.log(provider);
            });

            // console.log(keys);

            res
              .status(200)
              .send(returnVal);
            done();
            return;
          })
          .catch(err => { 
            // console.error('ERROR:', err); 
            res
              .status(501)
              .send("{success: false, err: " + err + "}");
            // done();
            return;
          });
        } else {
          res
            .status(401)
            .send("{success: false, err: 'method not supported'}");
          done();
          return;
        }
      debugger;

    });
};


