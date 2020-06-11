'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "parcontario-scar-signatures";

const kindName = 'Staff';

// testing travis ci/cd - take 3
exports.getStaffMember = (req, res) => {
    return cors(req, res, () => {

      let firstname = req.body.firstname || req.query.firstname || '';
      let lastname = req.body.lastname || req.query.lastname || '';

      let query = datastore.createQuery('Staff');

      if (firstname) {
        query.filter('firstname','=', firstname.trim());
      }  
      if (lastname) {
        query.filter('lastname','=',lastname.trim());
      }

      datastore.runQuery(query).then(results => {

        var returnVal;
        
        if (results[0].length == 1) {
          let staffMember = results[0][0];
          const staffMemberKey = staffMember[datastore.KEY];
          staffMember.id = staffMemberKey.id;
          returnVal = staffMember;
        } else {
          returnVal = {};
        }

        res.status(200).send(returnVal);
      })
      .catch(err => { console.error('ERROR:', err); });
    });
};