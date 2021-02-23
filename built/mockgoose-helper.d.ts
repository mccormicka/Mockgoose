export declare class MockgooseHelper {
    mongoose: any;
    mockgoose: any;
    debug: any;
    constructor(mongoose: any, mockgoose: any);
    setDbVersion(version: string): void;
    setProxy(proxy: string): void;
    reset(): Promise<void>;
    isMocked(): boolean;
}
