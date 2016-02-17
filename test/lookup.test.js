"use strict";
require("must")
var tc = require("canned-teamcity-responses.js")
var nock = require("nock")
var tri = require("../")

var ROOTURL = "https://teamcity.url"

describe("teamcity-rest-integration.js#lookup", function () {
  var T, stub, done
  before(function () { nock.disableNetConnect() })
  after(function () { nock.enableNetConnect() })
  beforeEach(function () {
    stub = nock(ROOTURL)
    done = stub.done.bind(stub)
    T = new tri({url: ROOTURL})
  })

  describe("#allQueuedBuilds", function () {
    it("should return empty array if no builds exists", function () {
      stub
        .filteringPath(function (path) {
          return path.split("?")[0]
        })
        .get("/httpAuth/app/rest/buildQueue")
        .reply(200, {count: 0})
      return T.lookup.allQueuedBuilds()
        .must.resolve.to.eql([])
        .then(done)
    })
  })

  describe("#allRunningBuilds", function () {
    it("should return empty array if no builds exists", function () {
      stub
        .filteringPath(function (path) {
          return path.split("?")[0]
        })
        .get("/httpAuth/app/rest/builds")
        .reply(200, {count: 0})
      return T.lookup.allRunningBuilds()
        .must.resolve.to.eql([])
        .then(done)
    })
  })

  describe("#build", function () {
    it("should resolve if build exists", function () {
      stub
        .get("/httpAuth/app/rest/builds/id:foo")
        .reply(200, tc.httpAuth.app.rest.builds.buildResponse())
      return T.lookup.build("foo")
        .must.resolve.to.eql(tc.httpAuth.app.rest.builds.buildResponse())
        .then(done)
    })
  })

  describe("#buildConfiguration", function () {
    it("should reject if build doesn't exist", function () {
      stub
        .get("/httpAuth/app/rest/buildTypes/id:foo")
        .reply(404, "Nothing found")
      return T.lookup.buildConfiguration("foo")
        .must.reject.to.error()
        .then(done)
    })

    it("should resolve if buildtype exists", function () {
      stub
        .get("/httpAuth/app/rest/buildTypes/id:foo")
        .reply(200, tc.httpAuth.app.rest.buildTypes.response())
      return T.lookup.buildConfiguration("foo")
        .must.resolve.to.eql(tc.httpAuth.app.rest.buildTypes.response())
        .then(done)
    })
  })

  describe("#queuedBuilds", function () {
    it("should be empty if no builds are queued", function () {
      stub
        .get("/httpAuth/app/rest/buildQueue")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.buildQueue.buildsResponse())
      return T.lookup.queuedBuilds("foo", "1/head")
        .must.resolve.to.eql([])
        .then(done)
    })

    it("should ignore mismatched id", function () {
      var build = tc.httpAuth.app.rest.buildQueue.queuedResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/buildQueue")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.buildQueue.buildsResponse(build))
      return T.lookup.queuedBuilds("bar", "1/head")
        .must.resolve.to.be.empty()
        .then(done)
    })

    it("should ignore mismatched branch name", function () {
      var build = tc.httpAuth.app.rest.buildQueue.queuedResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/buildQueue")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.buildQueue.buildsResponse(build))
      return T.lookup.queuedBuilds("foo", "99/head")
        .must.resolve.to.be.empty()
        .then(done)
    })

    it("should find the build", function () {
      var build = tc.httpAuth.app.rest.buildQueue.queuedResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/buildQueue")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.buildQueue.buildsResponse(build))
      return T.lookup.queuedBuilds("foo", "1/head")
        .must.resolve.to.eql([build])
        .then(done)
    })
  })

  describe("#runningBuilds", function () {
    it("should be empty if no builds are running", function () {
      stub
        .get("/httpAuth/app/rest/builds")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.builds.buildsResponse())
      return T.lookup.runningBuilds("foo", "1/head")
        .must.resolve.to.eql([])
        .then(done)
    })

    it("should ignore mismatched id", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/builds")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.builds.buildsResponse(build))
      return T.lookup.runningBuilds("bar", "1/head")
        .must.resolve.to.be.empty()
        .then(done)
    })

    it("should ignore mismatched branch name", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/builds")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.builds.buildsResponse(build))
      return T.lookup.runningBuilds("foo", "99/head")
        .must.resolve.to.be.empty()
        .then(done)
    })

    it("should find the build", function () {
      var build = tc.httpAuth.app.rest.builds.buildResponse(
        {buildTypeId: "foo", branchName: "1/head"})
      stub
        .get("/httpAuth/app/rest/builds")
        .query(true)
        .reply(200, tc.httpAuth.app.rest.builds.buildsResponse(build))
      return T.lookup.runningBuilds("foo", "1/head")
        .must.resolve.to.eql([build])
        .then(done)
    })
  })
})
