'use strict';
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const kindName = 'Staff';

exports.setStaffMember = (req, res) => {
    let staffID = req.body.staffID || req.query.staffID || '';
    let firstname = req.body.firstname || req.query.firstname || '';
    let lastname = req.body.lastname || req.query.lastname || '';

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
          const staffKey = staffMember[datastore.KEY];
          keys.push(staffKey);
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
              .catch(err => {
                  console.error('ERROR:', err);
                  res.status(400).send(err);
                  return;
              });
          res.send("{status: 'added staff member successfully'}");
        } else {
          
          console.log("printing keys now");
          var keys = results.map(function(staff) {
            console.log(staff[datastore.KEY]);
          });
	      res.status(401).send("{error: 'duplicate staff member found'}");      
        }
      })
      .catch(err => { console.error('ERROR:', err); });
    }
};
