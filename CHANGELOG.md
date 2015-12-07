Version | Description
--------|------------
5.0.4   | Updated mongodb-prebuilt dependency, which pudated mongodb-download dependency, which updated getos dependency versions, that fixed identification of Fedora releases
5.0.6   | Updated mongodb-prebuilt, that fixes issue with SUSE 11
5.0.9   | Updated mongodb-prebuilt, and added disconnected event listener, that calls database shutdown function now if mongoose.disconnect is called, and removed async dependency
5.0.10  | Merged fix that allows reconnect after disconnect is made
