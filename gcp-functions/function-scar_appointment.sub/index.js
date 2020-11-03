const {PubSub} = require('@google-cloud/pubsub');
const atob = require('atob');
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const BUCKET_NAME = "whitby-sigs.parcsignin.com";

const kindName = 'Appointment';

const pubSubClient = new PubSub();

// triggered by pubsub to retrieve appointments and store them in datastore and GCS
exports.scar_appointment = async (data, context) => {

    const msg = data;
    const details = msg.data ? Buffer.from(msg.data, 'base64').toString() : '';

    console.log(details);
    
    let params = JSON.parse(details);

    const unixTimestamp = new Date().getTime() * 1000;
    let appointmentID = params.apptID || 0;
    let patientID = params.patientID || '';
    let firstname = params.firstname || '';
    let lastname = params.lastname || '';
    let dob = params.dob || '';
    let current_datetime = params.current_datetime;    
    let signedInAt = params.signedInAt || current_datetime;
    let signedOutAt = params.signedOutAt || 0;
    let signature = params.signatureData || '';
    let signatureFilename = firstname + '_' + lastname + '_' + unixTimestamp + '.svg';
    let services = params.services || [];
    let staff = params.staff || '';

    // Upload a new file to Cloud Storage if we have events to save
    if (signature.length) {
        const file = storage.bucket(BUCKET_NAME).file(signatureFilename.trim());
        console.log(`Saving signature to ${signatureFilename} in bucket ${BUCKET_NAME}`);

        file.save(atob(signature), {'metadata':{contentType: 'image/svg+xml'}}).then(() => {
            console.log(`JSON written to ${signatureFilename.trim()}`);
        })
        .catch(err => {
            console.error('ERROR:', err);
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
    
  	console.log('saving data ' + key.path);  
    console.log("now going to datastore");
	datastore
		.save({
			key: key,
            data: dataToSave,
		})
		.catch(err => {
		    console.error('ERROR:', err);
		    return;
		});

    console.log("finished the datastore");

};
