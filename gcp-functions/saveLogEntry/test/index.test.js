//'use strict';

//const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
//const chai = require('chai');
//const expect = chai.expect;
const assert = require('assert');
const uuid = require('uuid');
const cors = require('cors')({origin: true});

const {saveLogEntry} = require('..');

describe('functions_http_post_method', () => {

  it('http:saveLogEntry: should handle POST', (done) => {
    const name = uuid.v4();
    const datetime = new Date();
    const req = {
      method: 'POST',
      headers: { origins: true },
      query: {},
      body: {
        datetime: datetime.toISOString(),
        errorcode: "410",
        message: "Test: something",
        severity: "error",
        system: "saveLogEntry.index_test.js"
      }
    }

    var send = sinon.stub();
    var statusCode = sinon.stub();
    statusCode.returns({send: send});

    const res = {
      status: statusCode,
      send: send,
      setHeader: (key, value) => {},
      getHeader: (value) => {}
    };

    saveLogEntry(req, res, () => {
      //debugger;
      assert.ok(res.send.calledOnce);
      assert.deepStrictEqual(res.status.firstCall.args[0], 200);
      assert.deepStrictEqual(res.send.firstCall.args, ["{status: 'added log successfully'}"]);
      done();
    });

    //-- debugger;
  });

  // POST with same description and no providerID - must fail

  // POST with providerID and no description - must fail

  // POST with providerID and description - handle it

});

describe('functions_http_get_method', () => {
  it('http:setProviders: should fail to GET', (done) => {

    const name = uuid.v4();
    const req = {
      method: 'GET',
      headers: { origins: true },
      path: "/",
      query: {},
      body: {}
    }

    var send = sinon.stub();
    var statusCode = sinon.stub();
    statusCode.returns({send: send});

    const res = {
      status: statusCode,
      send: send,
      setHeader: (key, value) => {},
      getHeader: (value) => {}
    };

    saveLogEntry(req, res, () => {
      debugger;
      assert.ok(res.send.calledOnce);
      assert.deepStrictEqual(res.status.firstCall.args[0], 501);
      assert.deepStrictEqual(res.send.firstCall.args, ["{'method not supported'}"]);
      done();
    });

  });

});

describe('functions_http_delete_method', () => {

  it('http:getProviders: should fail DELETE', (done) => {
    const name = uuid.v4();
    const req = {
      method: 'DELETE',
      headers: { origins: true },      
      path: "",
      query: {},
      body: {}
    }

    var send = sinon.stub();
    var statusCode = sinon.stub();
    statusCode.returns({send: send});

    const res = {
      status: statusCode,
      send: send,
      setHeader: (key, value) => {},
      getHeader: (value) => {}
    };

    saveLogEntry(req, res, () => {
      debugger;
      assert.ok(res.send.calledOnce);
      assert.deepStrictEqual(res.status.firstCall.args[0], 501);
      assert.deepStrictEqual(res.send.firstCall.args, ["{'method not supported'}"]);
      done();
    });

    //-- debugger;
  });
  
});


/*
  it('http:helloHttp: should handle PUT', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.method = 'PUT';
    httpSample.sample.helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 403);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Forbidden!');
  });

  it('http:helloHttp: should handle other methods', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.method = 'POST';
    httpSample.sample.helloHttp(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 405);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.deepStrictEqual(mocks.res.send.firstCall.args[0], {
      error: 'Something blew up!',
    });
  });
});


/*
describe('functions_http_content', () => {
  it('http:helloContent: should handle application/json', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers['content-type'] = 'application/json';
    mocks.req.body = {name: 'John'};
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
  });

  it('http:helloContent: should handle application/octet-stream', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers['content-type'] = 'application/octet-stream';
    mocks.req.body = Buffer.from('John');
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
  });

  it('http:helloContent: should handle text/plain', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers['content-type'] = 'text/plain';
    mocks.req.body = 'John';
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
  });

  it('http:helloContent: should handle application/x-www-form-urlencoded', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers['content-type'] = 'application/x-www-form-urlencoded';
    mocks.req.body = {name: 'John'};
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello John!');
  });

  it('http:helloContent: should handle other', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(mocks.res.send.firstCall.args[0], 'Hello World!');
  });

  it('http:helloContent: should escape XSS', () => {
    const mocks = getMocks();
    const httpSample = getSample();
    mocks.req.headers['content-type'] = 'text/plain';
    mocks.req.body = {name: '<script>alert(1)</script>'};
    httpSample.sample.helloContent(mocks.req, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnce, true);
    assert.strictEqual(mocks.res.status.firstCall.args[0], 200);
    assert.strictEqual(mocks.res.send.calledOnce, true);
    assert.strictEqual(
      mocks.res.send.firstCall.args[0].includes('<script>'),
      false
    );
  });
});

describe('functions_http_cors', () => {
  it('http:cors: should respond to preflight request (no auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunction(mocks.corsPreflightReq, mocks.res);

    assert.strictEqual(mocks.res.status.calledOnceWith(204), true);
    assert.strictEqual(mocks.res.send.called, true);
  });

  it('http:cors: should respond to main request (no auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunction(mocks.corsMainReq, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
  });

  it('http:cors: should respond to preflight request (auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunctionAuth(
      mocks.corsPreflightReq,
      mocks.res
    );

    assert.strictEqual(mocks.res.status.calledOnceWith(204), true);
    assert.strictEqual(mocks.res.send.calledOnce, true);
  });

  it('http:cors: should respond to main request (auth)', () => {
    const mocks = getMocks();
    const httpSample = getSample();

    httpSample.sample.corsEnabledFunctionAuth(mocks.corsMainReq, mocks.res);

    assert.strictEqual(mocks.res.send.calledOnceWith('Hello World!'), true);
  });
});
describe('functions_http_signed_url', () => {
  it('http:getSignedUrl: should process example request', async () => {
    const mocks = getMocks();
    const httpSample = getSample();

    const reqMock = {
      method: 'POST',
      body: {
        bucket: 'nodejs-docs-samples',
        filename: `gcf-gcs-url-${uuid.v4()}`,
        contentType: 'application/octet-stream',
      },
    };

    httpSample.sample.getSignedUrl(reqMock, mocks.res);

    // Instead of modifying the sample to return a promise,
    // use a delay here and keep the sample idiomatic
    await new Promise(resolve => setTimeout(resolve, 300));

    assert.strictEqual(mocks.res.status.called, false);
    assert.strictEqual(mocks.res.send.calledOnce, true);
  });
});
*/