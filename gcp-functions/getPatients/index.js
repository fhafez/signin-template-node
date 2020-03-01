'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: 'scenic-setup-231121'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "parcontario-scar-signatures";

// just testing ci/cd - take 4

const kindName = 'Patient';

// getPatients(firstname, lastname, dob) -> [Patient]
exports.getPatients = (req, res) => {
    return cors(req, res, () => {


      if (req.body.firstname) {

        const unixTimestamp = new Date().getTime() * 1000;
        let patientID = req.body.patientID || '';
        let firstname = req.body.firstname || '';
        let lastname = req.body.lastname || '';
        let dob = req.body.dob || '';
        let services = req.body.services || [];
        let overwrite = req.body.overwrite || false;
        let lastModifiedOn = unixTimestamp;
      
        var duplicatePatientFound = false;

        // if the patientID was provided in the body of a POST, create the patient
        if (patientID == '') {
          let query = datastore.createQuery('Patient'); //.select('__key__');
          
          if (dob) {
            query.filter('dob','=',dob.trim());
          }
          if (firstname) {
            query.filter('firstname','=', firstname.trim());
          }  
          if (lastname) {
            query.filter('lastname','=',lastname.trim());
          }
          
          datastore.runQuery(query).then(results => {
            let count = results[0].length;
            const patients = results[0];
            
            var keys = [];
            patients.forEach(patient => {
              const patientKey = patient[datastore.KEY];
              keys.push(patientKey);
              console.log(patient);
            });
            
            console.log(keys);

            if (count == 0) {
              var dataToSave = {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                dob: dob.trim(),
                services: services
              }

              const key = patientID > 0 ? datastore.key({path: ['Patient', datastore.int(patientID)]}) : datastore.key(kindName);
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
              var keys = results.map(function(patient) {
                console.log(patient[datastore.KEY]);
              });
            res.status(401).send("{error: 'duplicate patient found'}");      
            }
          })
          .catch(err => { console.error('ERROR:', err); });
        }

      } else {

        // if patientID was provided in the querystring of a GET then return the patient details
        let firstname = req.query.firstname || '';
        let lastname = req.query.lastname || '';
        let dob = req.query.dob || '';

        let query = datastore.createQuery('Patient');

        if (dob) {
          query.filter('dob','=',dob.trim());
        }
        if (firstname) {
          query.filter('firstname','=', firstname.trim());
        }  
        if (lastname) {
          query.filter('lastname','=',lastname.trim());
        }

        datastore.runQuery(query).then(results => {

          var returnVal = [];
          /*
          returnVal.count = results[0].length;
          returnVal.matches = [];
          */
          const patients = results[0];

          var keys = [];
          patients.forEach(patient => {
            const patientKey = patient[datastore.KEY];
            keys.push(patientKey.id);
            //returnVal.matches.push(patientKey.id);
            patient.id = patientKey.id;
            patient.dob = patient.dob.getFullYear() + '-' + patient.dob.getMonth() + '-' + patient.dob.getDate();
            returnVal.push(patient);
            console.log(patient);
          });

          console.log(keys);

          res.status(200).send(returnVal);
        })
        .catch(err => { console.error('ERROR:', err); });
      }
    });
};


