import { MongodHelper } from '../../mongodb-prebuilt';
export declare class Mockgoose {
    mongooseObj: any;
    mongodHelper: MongodHelper;
    constructor(mongooseObj: any);
    prepareStorage(): Promise<void>;
    mockConnectCalls(connection: string): void;
    getOpenPort(): Promise<number>;
    getMemoryStorageName(): string;
    getTempDBPath(): Promise<string>;
}
export declare class ConnectionWrapper {
    originalArguments: any;
    functionName: string;
    functionCode: void;
    connection: string;
    constructor(functionName: string, functionCode: void, connection: string);
    run(): void;
}
