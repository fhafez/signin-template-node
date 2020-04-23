const cors = require('cors')({origin: true});
const atob = require('atob');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "scarsigs.parcsignin.com";

const kindName = 'Appointment';

exports.setAppointment = (req, res) => {
  return cors(req, res, () => {

    const unixTimestamp = new Date().getTime() * 1000;
    let appointmentID = req.body.apptID || 0;
    let patientID = req.body.patientID || '';
    let firstname = req.body.firstname || '';
    let lastname = req.body.lastname || '';
    let dob = req.body.dob || '';
    let current_datetime = req.body.current_datetime;    
    let signedInAt = req.body.signedInAt || current_datetime;
    let signedOutAt = req.body.signedOutAt || 0;
    let signature = req.body.sig || '';
    let signatureFilename = firstname + '_' + lastname + '_' + unixTimestamp + '.svg';
    let services = req.body.services || [];
    let staff = req.body.staff || '';

    console.log(req.body);
    
    // Upload a new file to Cloud Storage if we have events to save
    if (signature.length) {
//        const bucketName = config.EVENT_BUCKET;
//        const unixTimestamp = new Date().getTime() * 1000;
//        const filename = `${unixTimestamp}-${uuid.v4()}.json`;
      const file = storage.bucket(BUCKET_NAME).file(signatureFilename.trim());
      console.log(`Saving signature to ${signatureFilename} in bucket ${BUCKET_NAME}`);

      file.save(atob(signature), {'metadata':{contentType: 'image/svg+xml'}}).then(() => {
        console.log(`JSON written to ${signatureFilename.trim()}`);
      })
      .catch(err => {
	    console.error('ERROR:', err);
		res.status(200).send(err);
		return;
	  });;
    }

    // first update the patient services counters, and set the signed_in to true
    const patientKey = datastore.key({path: ['Patient', datastore.int(patientID)]});
    var dataToSave = {
      firstname: firstname,
      lastname: lastname,
      dob: dob,
      signed_in: 1,
      services: services
    }
    
    datastore.save({key: patientKey, data: dataToSave})
	    .catch(err => {
		    console.error('ERROR:', err);
		    res.status(200).send(err);
		    return;
		});
    
    // then create the appointment
    dataToSave = {
      patientID: patientID,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dob: dob.trim(),
      signatureFilename: signatureFilename.trim(),
      signedInAt: datastore.int(signedInAt),
      signedOutAt: datastore.int(signedOutAt),
      staff: staff
      //				time_create: datastore.int(Math.floor(new Date().getTime()/1000))
	}
  
    const key = appointmentID > 0 ? datastore.key({path: ['Appointment', datastore.int(appointmentID)]}) : datastore.key(kindName);
  
	res.status(200).send(dataToSave);
  
  	console.log('saving data ' + key.path);  
    console.log("now going to datastore");
	datastore
		.save({
			key: key,
            data: dataToSave,
		})
		.catch(err => {
		    console.error('ERROR:', err);
		    res.status(200).send(err);
		    return;
		});

    console.log("finished the datastore");
  });
};