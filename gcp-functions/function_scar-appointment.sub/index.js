const {PubSub} = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

exports.printAppointment = async (data, context) => {
  
    const msg = data;
    const details = msg.data ? Buffer.from(msg.data, 'base64').toString() : '';

    console.log(`Got a message! ${details}`);
};