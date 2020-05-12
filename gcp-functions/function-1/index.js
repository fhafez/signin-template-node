const {PubSub} = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

exports.setAppointment = async (req, res) => {
    const unixTimestamp = new Date().getTime() * 1000;
    let appointmentID = req.body.apptID || 0;
    let patientID = req.body.patientID || '';
	  let firstname = req.body.firstname || '';
	  let lastname = req.body.lastname || '';
    let dob = req.body.dob || '';
    let signedInAt = req.body.signedInAt || '0';
    let signedOutAt = req.body.signedOutAt || 0;
	  let signature = req.body.sig || '';
    let signatureFilename = firstname + '_' + lastname + '_' + unixTimestamp;

/*
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
*/
    var dataToSave = {
      patientID: patientID,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dob: dob.trim(),
      signatureData: signature,
      signedInAt: signedInAt,
      signedOutAt: signedOutAt,
      signature: signature
      //				time_create: datastore.int(Math.floor(new Date().getTime()/1000))
    }
  
    const dataBuffer = Buffer.from(JSON.stringify(dataToSave));

    try {
      const messageId = await pubSubClient.topic("scar-appointment").publish(dataBuffer);
      console.log(`Message ${messageId} published`);
      res.status(200).send(`Message ${messageId} published`);
    } catch (err) {
      res.status(500).send(err);
      return Promise.reject(err);
    }
};