'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const kindName = 'Services';

exports.getServices = (req, res) => {
    return cors(req, res, () => {

      if (req.method == "DELETE") {

        if (req.path) {
          let serviceID = req.path.substr(1,);
          const serviceKey = datastore.key({path: [kindName, datastore.int(serviceID)]});
          datastore.delete(serviceKey);
        }
        console.log(req.path);
        res.status(200).send("{}");

      } else {


        if (req.body.description) {

          let desc = req.body.description || '';
          let serviceID = req.body.serviceID || '';

          console.log("serviceID is " + serviceID);
        
          // if the patientID was provided in the body of a POST, create the patient
          if (serviceID == '') {
            let query = datastore.createQuery('Services'); //.select('__key__');
            if (desc) {
              query.filter('desc','=',desc.trim());
            }

            datastore.runQuery(query).then(results => {
              let count = results[0].length;
              const services = results[0];
              
              var keys = [];
              services.forEach(service  => {
                const serviceKey = service[datastore.KEY];
                keys.push(serviceKey);
                console.log(service);
              });
              
              console.log(keys);

              if (count == 0) {
                var dataToSave = {
                  description: desc.trim()
                }

                const key = serviceID > 0 ? datastore.key({path: [kindName, datastore.int(serviceID)]}) : datastore.key(kindName);
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
                var keys = results.map(function(service) {
                  console.log(service[datastore.KEY]);
                });
              res.status(401).send("{error: 'duplicate service found'}");      
              }
            })
            .catch(err => { console.error('ERROR:', err); });
          }

        } else {

          // if patientID was provided in the querystring of a GET then return the patient details
          let desc = req.query.description || '';

          let query = datastore.createQuery('Services');

          if (desc) {
            query.filter('desc','=', desc.trim());
          }  

          datastore.runQuery(query).then(results => {

            var returnVal = [];
            /*
            returnVal.count = results[0].length;
            returnVal.matches = [];
            */
            const services = results[0];

            var keys = [];
            services.forEach(service => {
              const serviceKey = service[datastore.KEY];
              keys.push(serviceKey.id);
              service.id = serviceKey.id;
              returnVal.push(service);
              console.log(service);
            });

            console.log(keys);

            res.status(200).send(returnVal);
          })
          .catch(err => { console.error('ERROR:', err); });
        }
      }

    });
};


