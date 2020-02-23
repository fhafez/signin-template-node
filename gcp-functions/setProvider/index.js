'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: 'scenic-setup-231121'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const kindName = 'Provider';

exports.setProvider = (req, res) => {
    return cors(req, res, () => {

        // create a new entry
        if (req.body.description) {

          let desc = req.body.description || '';
          let providerID = req.body.providerID || '';
        
          // if the providerID was not provided in the body of a POST, create the provider
          if (providerID == '') {
            let query = datastore.createQuery('Provider'); //.select('__key__');
            if (desc) {
              query.filter('description','=',desc.trim());
            }

            // look for duplicate provider descriptions
            datastore.runQuery(query).then(results => {
              let count = results[0].length;
              const providers = results[0];
              
              var keys = [];
              providers.forEach(provider  => {
                const providerKey = provider[datastore.KEY];
                keys.push(providerKey);
                console.log(provider);
              });
              
              console.log(keys);

              if (count == 0) {
                var dataToSave = {
                  description: desc.trim()
                }

                const key = providerID > 0 ? datastore.key({path: ['Provider', datastore.int(providerID)]}) : datastore.key(kindName);
                datastore
                    .save({
                        key: key,
                        data: dataToSave,
                    })
                    .then(data => {
  //                    dataToSave.id = key;
                      res.send(data[0]["mutationResults"][0]["key"]["path"][0]);                     
                	  })
                    .catch(err => {
                        console.error('ERROR:', err);
                        res.status(400).send(err);
                        return;
                    });

              } else {
                
                console.log("printing keys now");
                var keys = results.map(function(provider) {
                  console.log(provider[datastore.KEY]);
                });
              res.status(401).send("{error: 'duplicate provider found'}");      
              }
            })
            .catch(err => { console.error('ERROR:', err); });
          }
        }

    });
};


