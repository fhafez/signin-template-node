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

exports.getStaff = (req, res) => {
    return cors(req, res, () => {


      if (req.body.firstname) {

        let staffID = req.body.staffID || '';
        let firstname = req.body.firstname || '';
        let lastname = req.body.lastname || '';
      
        // if the patientID was provided in the body of a POST, create the patient
        if (staffID == '') {
          let query = datastore.createQuery('Staff'); //.select('__key__');
          
          if (firstname) {
            query.filter('firstname','=', firstname.trim());
          }  
          if (lastname) {
            query.filter('lastname','=',lastname.trim());
          }
          
          datastore.runQuery(query).then(results => {
            let count = results[0].length;
            const staffMembers = results[0];
            
            var keys = [];
            staffMembers.forEach(staffMember => {
              const staffMemberKey = staffMember[datastore.KEY];
              keys.push(staffMemberKey);
              console.log(staffMember);
            });
            
            console.log(keys);

            if (count == 0) {
              var dataToSave = {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
              }

              const key = staffID > 0 ? datastore.key({path: ['Staff', datastore.int(staffID)]}) : datastore.key(kindName);
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
              var keys = results.map(function(staffMember) {
                console.log(staffMember[datastore.KEY]);
              });
            res.status(401).send("{error: 'duplicate staff member found'}");      
            }
          })
          .catch(err => { console.error('ERROR:', err); });
        }

      } else {

        // if patientID was provided in the querystring of a GET then return the patient details
        let firstname = req.query.firstname || '';
        let lastname = req.query.lastname || '';
        let dob = req.query.dob || '';

        let query = datastore.createQuery('Staff');

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
          const staffMembers = results[0];

          var keys = [];
          staffMembers.forEach(staffMember => {
            const staffMemberKey = staffMember[datastore.KEY];
            keys.push(staffMemberKey.id);
            staffMember.id = staffMemberKey.id;
            returnVal.push(staffMember);
            console.log(staffMember);
          });

          console.log(keys);

          res.status(200).send(returnVal);
        })
        .catch(err => { console.error('ERROR:', err); });
      }
    });
};


