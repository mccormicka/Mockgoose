import { MongodHelper } from 'mongodb-prebuilt';
import { MockgooseHelper } from './mockgoose-helper';
export declare class Mockgoose {
    helper: MockgooseHelper;
    mongodHelper: MongodHelper;
    debug: any;
    mongooseObj: any;
    constructor(mongooseObj: any);
    prepareStorage(): Promise<void>;
    shutdown(): Promise<number>;
    getMockConnectionString(port: string): string;
    mockConnectCalls(connection: string): void;
    getOpenPort(): Promise<number>;
    getMemoryStorageName(): string;
    getTempDBPath(): Promise<string>;
}
export declare class ConnectionWrapper {
    originalArguments: any;
    functionName: string;
    functionCode: any;
    mongoose: any;
    connectionString: string;
    constructor(functionName: string, mongoose: any, connectionString: string);
    run(args: any): void;
}
