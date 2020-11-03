'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const kindName = 'Patient';

// getPatients(firstname, lastname, dob) -> [Patient]
exports.getPatient = (req, res) => {
    return cors(req, res, () => {

      let firstname = req.query.firstname || '';
      let lastname = req.query.lastname || '';
      let dob = req.query.dob || '';

      let query = datastore.createQuery('Patient');

      if (dob) {
        query.filter('dob','=',dob.trim());
      }
      if (firstname && lastname) {
        query.filter('lowerName','=', firstname.trim().toLowerCase() + ' ' + lastname.trim().toLowerCase());
      } else {
        if (firstname) {
          query.filter('firstname','=', firstname.trim());
        }  
        if (lastname) {
          query.filter('lastname','=',lastname.trim());
        }
      }

      datastore.runQuery(query).then(results => {

        var returnVal;
        /*
        returnVal.count = results[0].length;
        returnVal.matches = [];
        */
        
        if (results[0].length == 1) {
          let patient = results[0][0];
          const patientKey = patient[datastore.KEY];
          patient.id = patientKey.id;
          returnVal = patient;
        } else {
          returnVal = {};
        }

        res.status(200).send(returnVal);
      })
      .catch(err => { console.error('ERROR:', err); });
    });
};