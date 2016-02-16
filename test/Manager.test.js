"use strict";
var expect = require("must")
var nock = require("nock")
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
})
