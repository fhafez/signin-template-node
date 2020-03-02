'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
});

const kindName = 'Patient';

exports.setPatient = (req, res) => {

    return cors(req, res, () => {

      const unixTimestamp = new Date().getTime() * 1000;
      let patientID = req.body.id || '';
      let firstname = req.body.firstname || '';
      let lastname = req.body.lastname || '';
      let dob = req.body.dob || '';
      let services = req.body.services || [];
      let overwrite = req.body.overwrite || false;
      let lastModifiedOn = unixTimestamp;
    
      var duplicatePatientFound = false;

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
  //        res.send(results[0][Datastore.KEY]);
          
  //        let patients = results[0];
  //        let patientKey = patient[this.datastore.KEY];
  //        console.log(patientKey.id);
          
          var keys = [];
          patients.forEach(patient => {
            const patientKey = patient[datastore.KEY];
  //          console.log(patientKey);
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
                .catch(err => {
                    console.error('ERROR:', err);
                    res.status(400).send(err);
                    return;
                });
            res.send("{status: 'added patient successfully'}");
          } else {
            
            console.log("printing keys now");
            var keys = results.map(function(patient) {
              console.log(patient[datastore.KEY]);
            });
  	      res.status(401).send("{error: 'duplicate patient found'}");      
          }
        })
        .catch(err => { console.error('ERROR:', err); });
      } else {

        // update the patient with the values provided
        const key = datastore.key(['Patient', datastore.int(patientID)]);
        datastore.get(key, (err, entity) => {
      
          if (err) {
            res.status(401).send("{error: " + err + "}");
          }
                
          if (firstname != '') entity.firstname = firstname;
          if (lastname != '') entity.lastname = lastname;
          if (dob != '') entity.dob = dob;
          if (services.length > 0) entity.services = services;

          datastore.save({
            key: key,
            data: entity
          }, (err) => {});
        });
      }
    });
};