export default class WavesDataProtocol {

    maxEntrySize = 100; //32767;

    serializeData(tx) {
        const dataToSerialize = JSON.stringify(tx);
        const identifier = tx.senderPublicKey + '_' + tx.id;
        const parts = Math.floor(dataToSerialize.length / this.maxEntrySize, 0) + 1;
        var dataEntries = [];

        dataEntries[0] = {
            'key': identifier + '_count',
            'type': 'integer',
            'value': parts
        };
        for (var i = 0; i < parts; i++) {
            const start = i * this.maxEntrySize;
            const end = start + this.maxEntrySize;
            dataEntries[i + 1] = {
                'key': identifier + '_' + i,
                'type': 'string',
                'value': dataToSerialize.substring(start, end)
            };
        }

        return dataEntries;
    }

}