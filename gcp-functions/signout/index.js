//'use strict';
const moment = require('moment');
const debug = require('debug');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
});

const kindName = 'Patient';

//testing travis
module.exports.signout = (req, res, done) => {

    const unixTimestamp = new Date().getTime() / 1000;
    let signoutTime = req.query.signoutTime || req.body.signoutTime || 0;
    let patientID = req.query.patientID || req.body.patientID || '';
    let lastModifiedOn = unixTimestamp;
    var m = moment().utcOffset(-4);
    const unixTimeNow = m.unix();
  
    if (patientID == '') {
        res.status(401).send("{error: \"Must provide patientID\"}");
        done();
        return;      
    }

    // lookup the patient
    const transaction = datastore.transaction();
    const patientKey = datastore.key({path: ['Patient', datastore.int(patientID)]});


      //-- debugger;

      transaction.run((err, transaction) => {

        //-- debugger;

        if (err) {
          transaction.rollback();
          console.log(err);
          res
            .status(500)
            .send("{success: false, err: " + err + "}");
            done();
            return;
        }

        // set the patient signed_in field to false
        //const [patient] = 
        transaction.get(patientKey, (err, patient)  => {

          patient.signed_in = false;

          //-- debugger;
          transaction.save({
            key: patientKey,
            data: patient,
          });

          //-- debugger;
          transaction.commit((err) => {

            if (err) {
              transaction.rollback();
              res
                .status(500)
                .send("{success: false, err: " + err + "}");
                done();
                return;
            }

            // lookup last appointment for this patient
            let query = datastore.createQuery('Appointment')
              .filter('patientID','=', patientID)
              .order('signedInAt', { descending: true })
              .limit(1);

            //-- debugger;
            query.run((err, entities) => {

              if (err) {
                res.status(400).send(err);
                done();
                return;
              }

              var returnval = {};
              
              // update the signedOutAt to current unix time
              //-- debugger;
              //console.log("entities found: " + entities.length);
              if (entities.length > 0) {

                //console.log(entities[0]);
                entities[0].signedOutAt = datastore.int(unixTimeNow);
                datastore.save({
                  key: entities[0][datastore.KEY],
                  method: 'update',
                  data: entities[0]
                }).catch(err => {
                  //-- debugger;
                  console.log("error update/saving the appointment");
                  res
                    .status(500)
                    .send("{success: false, err: " + err + "}");
                  done();
                  return;
                }).then((apiResponse) => {
                  //-- debugger;
                  res
                    .status(200)
                    .send("{success: true}");
                  done();
                  return;
                });

              }
            
            }); // end query.run()

          }); // end transaction.commit()

        }); // end transaction.get()

      });  // end await transaction.run() 

    //-- debugger;

};