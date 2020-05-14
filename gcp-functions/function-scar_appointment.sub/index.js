const {PubSub} = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();

exports.scar_appointment = async (data, context) => {
  
    const msg = data;
    const details = msg.data ? Buffer.from(msg.data, 'base64').toString() : '';

    let services = JSON.parse(details);

    // just print the message received - that's all
    console.log(`Got a message! ${details}`);
    console.log(`Services: ${services}`);
};