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

  describe("#post", function () {
    it("should post", function () {
      stub
        .post("/httpAuth/app/rest/builds/id:foo")
        .query(true)
        .reply(200, "response")
      return T.post({url: "httpAuth/app/rest/builds/id:foo"})
        .must.resolve.to.eql("response")
    })

    it("should reject on error", function () {
      stub
        .post("/httpAuth/app/rest/builds/id:foo")
        .query(true)
        .replyWithError(new Error("error"))
      return T.post({url: "httpAuth/app/rest/builds/id:foo"})
        .must.reject.to.error()
    })

    it("should reject 404", function () {
      stub
        .post("/httpAuth/app/rest/builds/id:foo")
        .query(true)
        .reply(404)
      return T.post({url: "httpAuth/app/rest/builds/id:foo"})
        .must.reject.to.error()
    })
  })
})
