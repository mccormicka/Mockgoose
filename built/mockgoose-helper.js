"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debug = require('debug');
var async_1 = require("async");
var httpsProxyAgent = require('https-proxy-agent');
var MockgooseHelper = /** @class */ (function () {
    function MockgooseHelper(mongoose, mockgoose) {
        this.mongoose = mongoose;
        this.mockgoose = mockgoose;
        this.debug = Debug('MockgooseHelper');
    }
    MockgooseHelper.prototype.setDbVersion = function (version) {
        {
            this.mockgoose.mongodHelper.mongoBin.mongoDBPrebuilt.mongoDBDownload.options.version = version;
        }
    };
    MockgooseHelper.prototype.setProxy = function (proxy) {
        this.mockgoose.mongodHelper.mongoBin.mongoDBPrebuilt.mongoDBDownload.options.http = {
            agent: new httpsProxyAgent(proxy)
        };
    };
    MockgooseHelper.prototype.reset = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            async_1.each(_this.mongoose.connections, function (connection, callback) {
                // check if it is mockgoose connection
                if (!/mockgoose-temp-db-/.test(connection.name)) {
                    return callback();
                }
                if (connection.readyState !== 1) {
                    return callback();
                }
                connection.dropDatabase(function (err) {
                    callback();
                }, function (e) {
                    _this.debug("@reset err dropping database " + e);
                    callback();
                });
            }, function (err) {
                if (err) {
                    _this.debug("@reset err " + err);
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    };
    ;
    MockgooseHelper.prototype.isMocked = function () {
        return this.mongoose.mocked;
    };
    return MockgooseHelper;
}());
exports.MockgooseHelper = MockgooseHelper;
//# sourceMappingURL=../src/mockgoose-helper.js.map