"use strict";
var _ = require("lodash")
var expect = require("must")
var nock = require("nock")
var s = require("util").format
var tri = require("../")

var ROOTURL = "https://teamcity.url"

describe("Manager", function () {
  var T, stub, done
  before(function () { nock.disableNetConnect() })
  after(function () { nock.enableNetConnect() })
  beforeEach(function () {
    stub = nock(ROOTURL)
    done = stub.done.bind(stub)
    T = new tri({url: ROOTURL})
  })

  it("should instantiate", function () {
    expect(T).to.be.an.object()
  })

  describe("#get", function () {
    it("should get", function () {
      stub
        .get("/foo")
        .reply(200, "bar")
      return T.get({url: "foo"})
        .must.resolve.to.eql("bar")
    })

    it("should reject on error", function () {
      stub
        .get("/foo")
        .replyWithError(new Error("error"))
      return T.get({url: "foo"})
        .must.reject.to.error()
    })

    it("should reject 404", function () {
      stub
        .get("/foo")
        .reply(404)
      return T.get({url: "foo"})
        .must.reject.to.error()
    })
  })

  describe("#post", function () {
    it("should post", function () {
      stub
        .post("/foo")
        .query(true)
        .reply(200, "bar")
      return T.post({url: "foo"})
        .must.resolve.to.eql("bar")
    })

    it("should reject on error", function () {
      stub
        .post("/foo")
        .query(true)
        .replyWithError(new Error("error"))
      return T.post({url: "foo"})
        .must.reject.to.error()
    })

    it("should reject 404", function () {
      stub
        .post("/foo")
        .query(true)
        .reply(404)
      return T.post({url: "foo"})
        .must.reject.to.error()
    })
  })

  var methods = ["add.buildToQueue", "cancel.stopBuild", "cancel.removeBuild",
                 "lookup.allQueuedBuilds", "lookup.allRunningBuilds",
                 "lookup.build", "lookup.buildConfiguration",
                 "lookup.queuedBuilds", "lookup.runningBuilds",
                 "resolve.dependencies", "resolve.vcsRoots"
  ]
  methods.forEach(function (meth) {
    it(s("should expose %s", meth), function () {
      expect(_.get(T, meth), s("%s not exposed", meth))
        .to.be.a.function()
    })
  })

  it("should not clobber namespaces", function () {
    expect(T.add).to.not.equal(T.resolve)
  })

  it("should only build its methods once", function () {
    var counter = 0
    T.on("registered", function (r) {
      counter++
    })
    T.add
    T.add
    expect(counter, "Wrong number of calls").to.eql(1)
  })
})
