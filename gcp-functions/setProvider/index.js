'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: 'scenic-setup-231121'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const kindName = 'Provider';

exports.setProvider = (req, res, done) => {

    return cors(req, res, () => {

      if (req.method == "DELETE") {

        if (req.path) {
          let providerID = req.path.substr(1,);
          const providerKey = datastore.key({path: ['Provider', datastore.int(providerID)]});
          datastore.delete(providerKey);

          res
            .status(200)
            .send("{success: true}");
          done();
          return;          
        } else {
          res
            .status(403)
            .send("{success: false, err: 'ID must be provided'}");
          done();
          return;
        }

      } else if (req.method == "POST") {

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
                // console.log(provider);
              });
              
              // console.log(keys);

              // if no matching description was found create the new provider
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
                      res
                        .status(200)
                        .send(data[0]["mutationResults"][0]["key"]["path"][0]);
                      done();
                      return;
                	  })
                    .catch(err => {
                        console.error('ERROR:', err);
                        res
                          .status(400)
                          .send(err);
                        done();
                        return;
                    });

              } else {
                
                /*
                // console.log("printing keys now");
                var keys = results.map(function(provider) {
                  // console.log(provider[datastore.KEY]);
                });
                */
                res
                  .status(401)
                  .send("{error: 'duplicate provider found'}");
                  done();
                  return;
              }
            }) // end datastore.runQuery
            .catch(err => { 
              console.error('ERROR:', err); 
            });
          } else {

            // provideID found, modify the desciption of provider
            const providerKey = datastore.key({path: ['Provider', datastore.int(providerID)]});

            transaction.run((err, transaction) => {

              //-- debugger;

              if (err) {
                transaction.rollback();
                console.log(err);
                res
                  .status(500)
                  .send("{success: false, err: " + err + "}");
                  done();
                  return;
              }

              // set the patient signed_in field to false
              //const [patient] = 
              transaction.get(patientKey, (err, patient)  => {

                patient.signed_in = false;

                //-- debugger;
                transaction.save({
                  key: patientKey,
                  data: patient,
                });

                //-- debugger;
                transaction.commit((err) => {

                  if (err) {
                    transaction.rollback();
                    res
                      .status(500)
                      .send("{success: false, err: " + err + "}");
                      done();
                      return;
                  }
                }); // end transaction.commit()
              }); // end transaction.get()
            }); // end transaction.run()
          } // end else providerID == ''
        } else {
          debugger;
          res
            .status(501)
            .send("{success: false, error: 'must provide description in BODY'}");
            done();
            return;
        } // end else req.body.description
      } else {
          res
            .status(501)
            .send("{success: false, error: 'method not supported'}");
            done();
            return;        
      }
    });
};


