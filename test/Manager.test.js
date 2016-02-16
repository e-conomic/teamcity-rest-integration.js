"use strict";
var expect = require("must")
var rewire = require("rewire")
var tri = require("../")

describe("Manager", function () {
  it("should be configurable via options", function () {
    var options = {
      user: "foo",
      password: "bar",
      url: "baz"
    }
    expect(new tri(options)).to.be.an.object()
  })
})
