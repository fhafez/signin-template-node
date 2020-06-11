const {PubSub} = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

// publish an appointment to pubsub
exports.createAppointment_pub = async (req, res) => {
    const unixTimestamp = new Date().getTime() * 1000;
    let appointmentID = req.body.apptID || 0;
    let patientID = req.body.patientID || '';
	  let firstname = req.body.firstname || '';
	  let lastname = req.body.lastname || '';
    let dob = req.body.dob || '';
    let signedInAt = req.body.signedInAt || '0';
    let signedOutAt = req.body.signedOutAt || 0;
    let signature = req.body.sig || '';
    let services = req.body.services || [];
    let signatureFilename = firstname + '_' + lastname + '_' + unixTimestamp;

    var dataToSave = {
      patientID: patientID,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dob: dob.trim(),
      signatureData: signature,
      signedInAt: signedInAt,
      signedOutAt: signedOutAt,
      services: services
    }

    const dataBuffer = Buffer.from(JSON.stringify(dataToSave));

    try {
      const messageId = await pubSubClient.topic("scar_appointment").publish(dataBuffer);
      console.log(`Message ${messageId} published`);
      res.status(200).send(`Message ${messageId} published`);
    } catch (err) {
      res.status(500).send(err);
      return Promise.reject(err);
    }
};