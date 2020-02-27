'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: 'scenic-setup-231121'
});

// testing travis function deployment
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const kindName = 'Provider';

exports.getProviders = (req, res) => {
    return cors(req, res, () => {

      if (req.method == "DELETE") {

        if (req.path) {
          let providerID = req.path.substr(1,);
          const providerKey = datastore.key({path: ['Provider', datastore.int(providerID)]});
          datastore.delete(providerKey);
        }
        console.log(req.path);
        res.status(200).send("{}");

      } else {

          // if provider description was provided in the querystring of a GET then return the provider record
          let desc = req.query.description || '';

          let query = datastore.createQuery('Provider');

          if (desc) {
            query.filter('description','=', desc.trim());
          }  

          datastore.runQuery(query).then(results => {

            var returnVal = [];
            /*
            returnVal.count = results[0].length;
            returnVal.matches = [];
            */
            const providers = results[0];

            var keys = [];
            providers.forEach(provider => {
              const providerKey = provider[datastore.KEY];
              keys.push(providerKey.id);
              provider.id = providerKey.id;
              returnVal.push(provider);
              console.log(provider);
            });

            console.log(keys);

            res.status(200).send(returnVal);
          })
          .catch(err => { console.error('ERROR:', err); });
        }

    });
};


