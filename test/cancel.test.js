"use strict";
require("must")
var tc = require("canned-teamcity-responses.js")
var nock = require("nock")
var rewire = require("rewire")
var tri = require("../")

var ROOTURL = "https://teamcity.url"

describe("teamcity-rest-integration.js#cancel", function () {
  var T, stub, done
  before(function () { nock.disableNetConnect() })
  after(function () { nock.enableNetConnect() })
  beforeEach(function () {
    stub = nock(ROOTURL)
    done = stub.done.bind(stub)
    T = new tri({url: ROOTURL})
  })

  describe("#stopBuild", function () {
    it("should stop running build", function () {
      stub
        .post("/httpAuth/app/rest/builds/id:foo")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.builds.canceledResponse())
        .get("/httpAuth/app/rest/builds/id:1258204")
        .reply(200, tc.httpAuth.app.rest.builds.buildResponse())

      return T.cancel.stopBuild("foo")
        .must.resolve.to.eql(tc.httpAuth.app.rest.builds.buildResponse())
        .then(done)
    })
  })

  describe("#removeBuild", function () {
    it("should remove queued build", function () {
      stub
        .post("/httpAuth/app/rest/buildQueue/id:foo")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.buildQueue.removeResponse())
        .get("/httpAuth/app/rest/builds/id:1262127")
        .reply(200, tc.httpAuth.app.rest.builds.buildResponse())

      return T.cancel.removeBuild("foo")
        .must.resolve.to.eql(tc.httpAuth.app.rest.builds.buildResponse())
        .then(done)
    })
  })
})


