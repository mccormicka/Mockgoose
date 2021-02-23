const Debug: any = require('debug');
import * as portfinder from 'portfinder';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import {MongodHelper} from 'mongodb-prebuilt';
import {MockgooseHelper} from './mockgoose-helper';
//const uuidV4 = require('uuid/v4');
const uuidV4: any = require('uuid/v4');

export class Mockgoose {
  
  helper: MockgooseHelper;
  mongodHelper: MongodHelper = new MongodHelper();
  debug: any;
  mongooseObj: any;
  
  constructor(mongooseObj: any) {
    this.debug = Debug('Mockgoose');
    this.helper = new MockgooseHelper(mongooseObj, this);

    this.mongooseObj = mongooseObj;
    this.mongooseObj.mocked = true;
  }
  
  prepareStorage(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let tempDBPathPromise: Promise<string> = this.getTempDBPath();
      let openPortPromise: Promise<number> = this.getOpenPort();
      
      Promise.all([tempDBPathPromise, openPortPromise]).then((promiseValues) => {
        let dbPath: string = promiseValues[0];
        let openPort: string = promiseValues[1].toString();
        let storageEngine: string = this.getMemoryStorageName();
        let mongodArgs: string[] = [
        '--port', openPort, 
        '--storageEngine', storageEngine,
        '--dbpath', dbPath
        ];
        this.debug(`@prepareStorage mongod args, ${mongodArgs}`);
        this.mongodHelper.mongoBin.commandArguments = mongodArgs;
        this.mongodHelper.run().then(() => {
          let connectionString: string = this.getMockConnectionString(openPort);
          this.mockConnectCalls(connectionString);
          resolve();
        }, (e: any) => {
          reject(e);
          // throw e;
          // return this.prepareStorage();
        });
      });
    });
  }

  shutdown(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.mongooseObj.disconnect();
      let timer = setTimeout(()=> {
        reject(new Error('Mockgoose timed out shutting down mongod'))
      }, 10000);
      this.mongodHelper.mongoBin.childProcess.on('exit', (code, signal) => {
        this.debug('mongod has exited with %s on %s', code, signal) 
        clearTimeout(timer);
        resolve(code);
      });
      this.mongodHelper.stop();
    });
  }
  
  getMockConnectionString(port: string): string {
    const dbName: string = 'mockgoose-temp-db-' + uuidV4();
    const connectionString: string = `mongodb://localhost:${port}/${dbName}`;
    return connectionString;
  }
  
  mockConnectCalls(connection: string) {
    let createConnection: ConnectionWrapper = new ConnectionWrapper('createConnection', this.mongooseObj, connection);
    this.mongooseObj.createConnection = function() { return createConnection.run(arguments) };
    let connect: ConnectionWrapper = new ConnectionWrapper('connect', this.mongooseObj, connection);
    this.mongooseObj.connect = function() { return connect.run(arguments) };
  }
  
  getOpenPort(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      portfinder.getPort({port: 27017}, function (err, port) {
        if ( err ) {
          reject(err)
        } else {
          resolve(port);        
        }
      });
    });
  }
  
  // todo: add support to mongodb-download or prebuilt to return version
  getMemoryStorageName(): string {
    return "ephemeralForTest";
    
  }
  
  getTempDBPath(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let tempDir: string = path.resolve(os.tmpdir(), "mockgoose", Date.now().toString());
      fs.ensureDir(tempDir, (err: any) => {
        if (err) throw err;
        resolve(tempDir);
      });
    });
  }
}

export class ConnectionWrapper {
  
  originalArguments: any;
  functionName: string;
  functionCode: any;
  mongoose: any;
  connectionString: string;
  
  constructor(
  functionName: string, mongoose: any, connectionString: string
  ) {
    this.functionName = functionName;
    this.mongoose = mongoose;
    this.functionCode = mongoose[functionName];
    this.connectionString = connectionString;
  }
  
  run(args: any): void {
    this.originalArguments = args;
    let mockedArgs: any = args;
    mockedArgs[0] = this.connectionString;
    return this.functionCode.apply(this.mongoose, mockedArgs);
  }

}



