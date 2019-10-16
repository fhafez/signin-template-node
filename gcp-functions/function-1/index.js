const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'scenic-setup-231121'
	//keyFilename: 'scenic-setup-231121-337cda78fcb2.json'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "parcontario-scar-signatures";

const kindName = 'Appointment';

exports.setAppointment = (req, res) => {
    const unixTimestamp = new Date().getTime() * 1000;
    let appointmentID = req.body.apptID || 0;
    let patientID = req.body.patientID || '';
	let firstname = req.body.firstname || '';
	let lastname = req.body.lastname || '';
    let dob = req.body.dob || '';
    let signedInAt = req.body.signedInAt || '0';
    let signedOutAt = req.body.signedOutAt || 0;
	let signature = req.body.signature || '';
    let signatureFilename = firstname + '_' + lastname + '_' + unixTimestamp;

    // Upload a new file to Cloud Storage if we have events to save
    if (signature.length) {
//        const bucketName = config.EVENT_BUCKET;
//        const unixTimestamp = new Date().getTime() * 1000;
//        const filename = `${unixTimestamp}-${uuid.v4()}.json`;
      const file = storage.bucket(BUCKET_NAME).file(signatureFilename.trim());
      console.log(`Saving signature to ${signatureFilename} in bucket ${BUCKET_NAME}`);

      file.save(signature).then(() => {
        console.log(`JSON written to ${signatureFilename.trim()}`);
      })
      .catch(err => {
	    console.error('ERROR:', err);
		res.status(200).send(err);
		return;
	  });;
    }

    var dataToSave = {
      patientID: patientID,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dob: dob.trim(),
      signatureFilename: signatureFilename.trim(),
      signedInAt: datastore.int(signedInAt),
      signedOutAt: datastore.int(signedOutAt),
      //				time_create: datastore.int(Math.floor(new Date().getTime()/1000))
	}
  
    const key = appointmentID > 0 ? datastore.key({path: ['Appointment', datastore.int(appointmentID)]}) : datastore.key(kindName);
  
	res.status(200).send("awesome");
  
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
};