'use strict';
const cors = require('cors')({"origin": true, "methods": "GET, POST, PUT, DELETE"});
const moment = require('moment');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "parcontario-scar-signatures";

const kindName = 'Appointment';

// getAppointments(fromDate, toDate, firstname, lastname, dob) -> [appointment]
exports.getAppointments = (req, res) => {
  return cors(req, res, () => {

    //process.env.TZ = "America/Toronto";
    
    if (req.method == "PUT") {

      console.log("PUT called!");

    } else if (req.method == "DELETE") {

      let appointmentID = req.url || '';

      if (appointmentID) {
        appointmentID = appointmentID == "/" ? "" : appointmentID.trim().substring(1,);
      }
      //let query = datastore.createQuery('Appointment');

      if (appointmentID) {

        let transaction = datastore.transaction();
        let appointmentKey = datastore.key({path: ['Appointment', datastore.int(appointmentID)]});
        transaction.run((err) => {
          if (err) {
            res.status(404).send(err);
            console.error('ERROR:', err);
            return;
          }

          transaction.delete(appointmentKey);

          transaction.commit((err) => {
            if (!err) {
              res.status(200).send("{}");
              return;
            }
          });
        });
      } else {
        res.status(404).send("{'error': 'must provide appointment ID'}");
      }

    } else {

      console.log(new Date().toLocaleString("en-US", {timeZone: "America/Toronto"}));
      //var m = moment().subtract(4, 'hours').hours(0).minutes(0).seconds(0);
      var m = moment().utcOffset(-4).hours(0).minutes(0).seconds(0);;
      const unixTimestampStartOfToday = m.unix();
      const unixTimestampEndOfToday =  unixTimestampStartOfToday + 86400;
      var fromDate = req.query.fromDate || req.body.fromDate || unixTimestampStartOfToday;
      var toDate = req.query.toDate || req.body.toDate || unixTimestampEndOfToday;
      let firstname = req.query.firstname || req.body.firstname || '';
      let lastname = req.query.lastname || req.body.lastname || '';
      let dob = req.query.dob || req.body.dob || '';

      fromDate = datastore.int(fromDate);
      toDate = datastore.int(toDate);
    
      console.log('from date ' + fromDate);
      console.log('to date ' + toDate);
      console.log('doing a query from ' + unixTimestampStartOfToday + ' to ' + unixTimestampEndOfToday);
    
    let query = datastore.createQuery('Appointment');

      if (dob) {
        query.filter('dob','=',dob.trim());
      }
      if (firstname) {
        query.filter('firstname','=', firstname.trim());
      }  
      if (lastname) {
        query.filter('lastname','=',lastname.trim());
      }
    
      query.filter('signedInAt','>', fromDate)
      query.filter('signedInAt','<', toDate)
      query.order('signedInAt');
    
      datastore.runQuery(query, (err, entities, info) => {
        if (err) {
          console.log("error found");
          res.status(400).send(err);
          return;
        }
        
        let appointments = [];
        
        entities.forEach(appt => {
          const apptKey = appt[datastore.KEY];
          appt.id = apptKey.id;
          appointments.push(appt);
        });

      //var firstEntityKey = entities[0][datastore.KEY];
        //console.log('first entity key ' + firstEntityKey.key);
        res.status(200).send(appointments);
      });             

      console.log("finished the datastore");

    }

    //res.status(200).send('nothing');
  });
};