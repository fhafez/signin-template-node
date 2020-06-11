'use strict';
const cors = require('cors')({origin: true});
const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore({
	projectId: 'signaturemountain-240415'
});

const kindName = 'Log';

exports.saveLogEntry = (req, res, done) => {
  return cors(req, res, () => {

    if (req.method != 'POST') {
      res
        .status(501)
        .send("{'method not supported'}");
      done();
      return;
    }

    const unixTimestamp = new Date().getTime() * 1000;
    let datetime = req.body.datetime || '';
  	let errorcode = req.body.errorcode || '';
  	let message = req.body.message || '';
    let severity = req.body.severity || '';
    let system = req.body.system || [];

    var dataToSave = {
      datetime: datetime,
      errorcode: errorcode,
      message: message,
      severity: severity,
      message: message,
      system: system
    }

    const key = datastore.key(kindName);
    datastore
      .save({
      key: key,
      data: dataToSave,
    })
      .catch(err => {
      //console.error('ERROR:', err);
      res
        .status(400)
        .send(err);
      done();
      return;
    });
    res
      .status(200)
      .send("{status: 'added log successfully'}");
    done();
    return;
  });
};