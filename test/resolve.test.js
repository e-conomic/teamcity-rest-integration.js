"use strict";
require("must")
var tc = require("canned-teamcity-responses.js")
var nock = require("nock")
var tri = require("../")

var ROOTURL = "https://teamcity.url"

describe("teamcity-rest-integration.js#resolve", function () {
  var T, stub, done
  before(function () { nock.disableNetConnect() })
  after(function () { nock.enableNetConnect() })
  beforeEach(function () {
    stub = nock(ROOTURL)
    done = stub.done.bind(stub)
    T = new tri({url: ROOTURL})
  })

  describe("#dependencies", function () {
    it("should get dependencies", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse()
      stub
        .get("/httpAuth/app/rest/builds/id:1258177")
        .reply(200, build)
      return T.resolve.dependencies([build])
        .must.resolve.to.eql([build])
        .then(done)
    })

    it("should support missing dependencies", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse(
        {"snapshot-dependencies": undefined})
      return T.resolve.dependencies([build])
        .must.resolve.to.eql([])
    })
  })

  describe("#vcsRoots", function () {
    it("should get related vcs-roots", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse()
      var vcsRoot = tc.httpAuth.app.rest.vcsRoots.rootResponse()
      stub
        .get("/httpAuth/app/rest/vcs-root-instances/id:796")
        .reply(200, vcsRoot)
      return T.resolve.vcsRoots([build])
        .must.resolve.to.eql([vcsRoot])
        .then(done)
    })

    it("should support missing revisions", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse({revisions: undefined})
      return T.resolve.vcsRoots([build])
        .must.resolve.to.eql([])
    })
  })
})
