"use strict";
var tcp = require("teamcity-properties.js")

exports.buildToQueue = function (typeId, branchName, params) {
  var payload = {
    url: "httpAuth/app/rest/buildQueue",
    body: {
      buildType: {id: typeId},
      branchName: branchName,
      properties: params ? tcp.parametersToProperties(params) : {}
    }
  }
  return this.post(payload)
}
