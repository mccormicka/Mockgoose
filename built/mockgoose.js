"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debug = require('debug');
var portfinder = require("portfinder");
var os = require("os");
var path = require("path");
var fs = require("fs-extra");
var mongodb_prebuilt_1 = require("mongodb-prebuilt");
var mockgoose_helper_1 = require("./mockgoose-helper");
//const uuidV4 = require('uuid/v4');
var uuidV4 = require('uuid/v4');
var Mockgoose = /** @class */ (function () {
    function Mockgoose(mongooseObj) {
        this.mongodHelper = new mongodb_prebuilt_1.MongodHelper();
        this.debug = Debug('Mockgoose');
        this.helper = new mockgoose_helper_1.MockgooseHelper(mongooseObj, this);
        this.mongooseObj = mongooseObj;
        this.mongooseObj.mocked = true;
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
                var mongodArgs = [
                    '--port', openPort,
                    '--storageEngine', storageEngine,
                    '--dbpath', dbPath
                ];
                _this.debug("@prepareStorage mongod args, " + mongodArgs);
                _this.mongodHelper.mongoBin.commandArguments = mongodArgs;
                _this.mongodHelper.run().then(function () {
                    var connectionString = _this.getMockConnectionString(openPort);
                    _this.mockConnectCalls(connectionString);
                    resolve();
                }, function (e) {
                    reject(e);
                    // throw e;
                    // return this.prepareStorage();
                });
            });
        });
    };
    Mockgoose.prototype.shutdown = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.mongooseObj.disconnect();
            var timer = setTimeout(function () {
                reject(new Error('Mockgoose timed out shutting down mongod'));
            }, 10000);
            _this.mongodHelper.mongoBin.childProcess.on('exit', function (code, signal) {
                _this.debug('mongod has exited with %s on %s', code, signal);
                clearTimeout(timer);
                resolve(code);
            });
            _this.mongodHelper.stop();
        });
    };
    Mockgoose.prototype.getMockConnectionString = function (port) {
        var dbName = 'mockgoose-temp-db-' + uuidV4();
        var connectionString = "mongodb://localhost:" + port + "/" + dbName;
        return connectionString;
    };
    Mockgoose.prototype.mockConnectCalls = function (connection) {
        var createConnection = new ConnectionWrapper('createConnection', this.mongooseObj, connection);
        this.mongooseObj.createConnection = function () { return createConnection.run(arguments); };
        var connect = new ConnectionWrapper('connect', this.mongooseObj, connection);
        this.mongooseObj.connect = function () { return connect.run(arguments); };
    };
    Mockgoose.prototype.getOpenPort = function () {
        return new Promise(function (resolve, reject) {
            portfinder.getPort({ port: 27017 }, function (err, port) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(port);
                }
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
var ConnectionWrapper = /** @class */ (function () {
    function ConnectionWrapper(functionName, mongoose, connectionString) {
        this.functionName = functionName;
        this.mongoose = mongoose;
        this.functionCode = mongoose[functionName];
        this.connectionString = connectionString;
    }
    ConnectionWrapper.prototype.run = function (args) {
        this.originalArguments = args;
        var mockedArgs = args;
        mockedArgs[0] = this.connectionString;
        return this.functionCode.apply(this.mongoose, mockedArgs);
    };
    return ConnectionWrapper;
}());
exports.ConnectionWrapper = ConnectionWrapper;
//# sourceMappingURL=../src/mockgoose.js.map