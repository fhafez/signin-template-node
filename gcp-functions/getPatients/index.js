'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
	//keyFilename: 'scenic-setup-231121-337cda78fcb2.json'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "parcontario-scar-signatures";

const kindName = 'Patient';

// getPatients(firstname, lastname, dob) -> [Patient]
exports.getPatients = (req, res) => {
    return cors(req, res, () => {

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

        var returnVal = {}
        returnVal.count = results[0].length;
        returnVal.matches = [];
        const patients = results[0];

        var keys = [];
        patients.forEach(patient => {
          const patientKey = patient[datastore.KEY];
          keys.push(patientKey.id);
          returnVal.matches.push(patientKey.id);
          console.log(patient);
        });

        console.log(keys);

        res.status(200).send(returnVal);
      })
      .catch(err => { console.error('ERROR:', err); });
    });
};
