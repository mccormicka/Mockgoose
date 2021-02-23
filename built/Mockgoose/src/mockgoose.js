"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portfinder = require("portfinder");
var os = require("os");
var path = require("path");
var fs = require("fs-extra");
var mongodb_prebuilt_1 = require("../../mongodb-prebuilt");
var Mockgoose = (function () {
    function Mockgoose(mongooseObj) {
        this.mongooseObj = mongooseObj;
    }
    Mockgoose.prototype.prepareStorage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var tempDBPathPromise = _this.getTempDBPath();
            var openPortPromise = _this.getOpenPort();
            Promise.all([tempDBPathPromise, openPortPromise]).then(function (promiseValues) {
                var dbPath = promiseValues[0];
                var openPort = promiseValues[1].toString();
                var storageEngine = _this.getMemoryStorageName();
                var mongodHelper = new mongodb_prebuilt_1.MongodHelper([
                    '--port', openPort,
                    '--storageEngine', storageEngine,
                    '--dbPath', dbPath
                ]);
                mongodHelper.run().then(function () {
                    _this.mockConnectCalls(openPort);
                    resolve();
                }, function (e) {
                    throw e;
                });
            });
        });
    };
    Mockgoose.prototype.mockConnectCalls = function (connection) {
        this.mongooseObj.createConnection = new ConnectionWrapper('createConnection', this.mongooseObj.createConnection, connection).run;
        this.mongooseObj.connect = new ConnectionWrapper('connect', this.mongooseObj.createConnection, connection).run;
    };
    Mockgoose.prototype.getOpenPort = function () {
        return new Promise(function (resolve, reject) {
            portfinder.getPort({ port: 27017 }, function (err, port) {
                resolve(port);
            });
        });
    };
    // todo: add support to mongodb-download or prebuilt to return version
    Mockgoose.prototype.getMemoryStorageName = function () {
        return "ephemeralForTest";
    };
    Mockgoose.prototype.getTempDBPath = function () {
        return new Promise(function (resolve, reject) {
            var tempDir = path.resolve(os.tmpdir(), "mockgoose", Date.now().toString());
            fs.ensureDir(tempDir, function (err) {
                if (err)
                    throw err;
                resolve(tempDir);
            });
        });
    };
    return Mockgoose;
}());
exports.Mockgoose = Mockgoose;
var ConnectionWrapper = (function () {
    function ConnectionWrapper(functionName, functionCode, connection) {
        this.functionName = functionName;
        this.functionCode = functionCode;
        this.connection = connection;
    }
    ConnectionWrapper.prototype.run = function () {
        this.originalArguments = arguments;
        console.log('here');
    };
    return ConnectionWrapper;
}());
exports.ConnectionWrapper = ConnectionWrapper;
//# sourceMappingURL=/Users/winfinit/workspace/rj/Mockgoose/Mockgoose/src/mockgoose.js.map