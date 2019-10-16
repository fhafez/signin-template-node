'use strict';
const moment = require('moment');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
	//keyFilename: 'scenic-setup-231121-337cda78fcb2.json'
});

const kindName = 'Patient';

exports.signout = (req, res) => {
    const unixTimestamp = new Date().getTime() / 1000;
    let signoutTime = req.body.signoutTime || 0;
    let patientID = req.body.patientID || '';
    let lastModifiedOn = unixTimestamp;
    var m = moment().utcOffset(-4);
    const unixTimeNow = m.unix();
  
    console.log(patientID);
  	//res.status(200).send("awesome");

    // lookup the patient
    const key = datastore.key(['Patient', datastore.int(patientID)]);
    datastore.get(key, (err, entity) => {
    
      if (err) {
        res.status(401).send("{error: " + err + "}");
      }
      
      console.log(entity);
      
      // update the signed_in to False
      entity.signed_in = false;

      datastore.save({
        key: key,
        data: entity
      }, (err) => {});
      
      // lookup the last appointment by this patient
    
      let query = datastore.createQuery('Appointment');
      query.filter('patientID','=', datastore.int(patientID));
      query.order('signedInAt', { descending: true });
      query.limit(1);

      datastore.runQuery(query, (err, entities, info) => {
        if (err) {
          console.log("error found " + err);
          res.status(400).send(err);
          return;
        }

        var returnval = {};
        
        // update the signedOutAt to current unix time
        
		console.log(entities.length);
        if (entities.length > 0) {
	        console.log(entities[0]);
    	    entities[0].signedOutAt = datastore.int(unixTimeNow);
          	datastore.save({
              key: entities[0][datastore.KEY],
              data: entities[0]
            }).then((data) => {
                console.log(data);
	          	returnval = { "status": "success", "id": patientID, "data": data };  
                res.status(200).send(returnval);
            });
        }
        
      });

    });
      
//    res.status(200).send({});

};