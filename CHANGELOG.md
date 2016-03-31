Version | Description
--------|------------
5.0.4   | Updated mongodb-prebuilt dependency, which pudated mongodb-download dependency, which updated getos dependency versions, that fixed identification of Fedora releases
5.0.6   | Updated mongodb-prebuilt, that fixes issue with SUSE 11
5.0.9   | Updated mongodb-prebuilt, and added disconnected event listener, that calls database shutdown function now if mongoose.disconnect is called, and removed async dependency
5.0.10  | Merged fix that allows reconnect after disconnect is made
5.0.11	| Added fix for reset method, which was broken after removal of async, updated documentation with reset method
5.1.0	| Added unmock and unmockAndReconnect functions
6.0.0	| Removed support for 0.10 nodeJS and changed mock interface to utilize promises, to avoid race conditions
