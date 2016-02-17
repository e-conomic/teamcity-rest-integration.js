"use strict";
require("must")
var tc = require("canned-teamcity-responses.js")
var nock = require("nock")
var tri = require("../")

var ROOTURL = "https://teamcity.url"

describe("teamcity-rest-integration.js#add", function () {
  describe("#buildToQueue", function () {
    var T, stub, done
    before(function () { nock.disableNetConnect() })
    after(function () { nock.enableNetConnect() })
    beforeEach(function () {
      stub = nock(ROOTURL)
      done = stub.done.bind(stub)
      T = new tri({url: ROOTURL})
    })

    it("should add to queue", function () {
      stub
        .post("/httpAuth/app/rest/buildQueue")
        .reply(200, tc.httpAuth.app.rest.buildQueue.queuedResponse())
      return T.add.buildToQueue("foo", "1/head")
        .must.resolve.to.eql(tc.httpAuth.app.rest.buildQueue.queuedResponse())
        .then(done)
    })

    it("should transform parameters", function () {
      stub
        .post("/httpAuth/app/rest/buildQueue", {
          buildType: {id: "foo"},
          branchName: "1/head",
          properties: {"property": [{"name": "foo", "value": "bar"}]}
        })
        .reply(200, tc.httpAuth.app.rest.buildQueue.queuedResponse())
      return T.add.buildToQueue("foo", "1/head", {foo: "bar"})
        .then(done)
    })
  })
})
