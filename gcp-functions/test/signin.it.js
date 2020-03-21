const chai = require("chai");
const expect = chai.expect;

const getPatient = require("../getPatient/index.js");

  /*
describe("smoke test", function() {
  it("just checking", function() {
    expect(true).to.be.true;
  });  
});
*/

describe("getPatient", function() {
  it("should get a patient", function() {
    let req = {};
    let res = {
      send: function() {}
    }
    getPatient.getPatient(req, res);
  });
});
