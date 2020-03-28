//'use strict';
const moment = require('moment');
const debug = require('debug');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
});

const kindName = 'Patient';

//testing travis
exports.signout = async (req, res, done) => {

    const unixTimestamp = new Date().getTime() / 1000;
    let signoutTime = req.query.signoutTime || req.body.signoutTime || 0;
    let patientID = req.query.patientID || req.body.patientID || '';
    let lastModifiedOn = unixTimestamp;
    var m = moment().utcOffset(-4);
    const unixTimeNow = m.unix();
  
    if (patientID == '') {
        res.status(401).send("{error: \"Must provide patientID\"}");
        return;      
    }

    // lookup the patient
    const transaction = datastore.transaction();
    const patientKey = datastore.key({path: ['Patient', datastore.int(patientID)]});

    try {

      debugger;

      await transaction.run(async(err, transaction) => {

        debugger;

        if (err) {
          transaction.rollback();
          console.log(err);
          res
            .status(500)
            .send("{success: false, err: " + err + "}");
            return;
        }

        // set the patient signed_in field to false
        //const [patient] = 
        await transaction.get(patientKey, async (err, patient)  => {

          patient.signed_in = false;

          debugger;
          transaction.save({
            key: patientKey,
            data: patient,
          });

          debugger;
          transaction.commit((err) => {

            if (err) {
              transaction.rollback();
              res
                .status(500)
                .send("{success: false, err: " + err + "}");
                return;
            }

            // lookup last appointment for this patient
            let query = datastore.createQuery('Appointment')
              .filter('patientID','=', patientID)
              .order('signedInAt', { descending: true })
              .limit(1);

            debugger;
            query.run((err, entities) => {

              if (err) {
                console.log("error found " + err);
                res.status(400).send(err);
                return;
              }

              var returnval = {};
              
              // update the signedOutAt to current unix time
              debugger;
              console.log("entities found: " + entities.length);
              if (entities.length > 0) {

                //console.log(entities[0]);
                entities[0].signedOutAt = datastore.int(unixTimeNow);
                datastore.save({
                  key: entities[0][datastore.KEY],
                  method: 'update',
                  data: entities[0]
                }).catch(err => {
                  debugger;
                  console.log("error update/saving the appointment");
                  res
                    .status(500)
                    .send("{success: false, err: " + err + "}");
                  res.finished = true;              
                  return;
                }).then((apiResponse) => {
                  debugger;
                  res
                    .status(200)
                    .send("{success: true}");
                  res.finished = true;
                  return;
                });

              }
            
            }); // end query.run()

          }); // end transaction.commit()

        }); // end transaction.get()

      });  // end await transaction.run()

    } catch (err) {
      debugger;
      console.log("error update/saving the appointment");
      res
        .status(500)
        .send("{success: false, err: " + err + "}");
      res.finished = true;              
      return;      
    }

    debugger;
/*
    res
      .status(200)
      .send("{success: true}");
    res.finished = true;
    return;
*/
/*


      const [patient] = await transaction.get(patientKey);
      patient.dob = patient.dob.toJSON().substring(0,10);

      patient.signedOutAt = datastore.int(unixTimeNow);

      transaction.save({
        key: patientKey,
        data: patient,
      });
      await transaction.commit();

      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`patient ${Id} updated successfully`)
        .end();
    } catch (err) {
      transaction.rollback();
      res
        .status(500)
        .send()
        .end();    
      throw err;
    }


    //const key = datastore.key(['Patient', datastore.int(patientID)]);

    datastore.get(key, (err, entity) => {
    
      if (err) {
        res.status(401).send("{error: " + err + "}");
        return;
      }
      
      //console.log(entity);
      
      // update the signed_in to False
      entity.signed_in = false;

      datastore.save({
        key: key,
        data: entity
      }, (err) => {});
      
      // lookup the last appointment by this patient
      let query = datastore.createQuery('Appointment');
      query.filter('patientID','=', patientID);
      query.order('signedInAt', { descending: true });
      query.limit(1);

      datastore.runQuery(query, (err, entities, info) => {
        if (err) {
          console.log("error found " + err);
          res.status(400).send(err).end();
          return;
        }

        var returnval = {};
        
        // update the signedOutAt to current unix time
        
		    //console.log(entities.length);
        if (entities.length > 0) {

	        //console.log(entities[0]);
    	    entities[0].signedOutAt = datastore.int(unixTimeNow);
          datastore.save({
            key: entities[0][datastore.KEY],
            data: entities[0]
          }).then((data) => {
            //console.log(data);
          	returnval = { "status": "success", "id": patientID, "data": data };  
            //res.status(200).send(returnval).end();
            res.status(200).send("");
            console.log("finished");
            return;
          });
        }
      });
    });
      
    //res.status(200).send("");
    res.status(200).end();
    console.log("after finished");
*/
};