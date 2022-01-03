import config from '../conf/config';

export default class WavesDataProtocol {

    maxEntrySize = 100; //32767;

    serializeData(tx) {
        const dataToSerialize = JSON.stringify(tx);
        const identifier = tx.id; //tx.senderPublicKey + '_' + tx.id;
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

    async getMultisigPublicKey(address) {
        const multisigPublicKeyResponse = await fetch(config.node + '/addresses/data/' + address + '/publicKey');
        const multisigPublicKey = await multisigPublicKeyResponse.json();

        return multisigPublicKey.value;
    }

    async getTransaction(transactionCount, address) {
        const count = transactionCount.value;
        const identifier = transactionCount.key.substring(0, transactionCount.key.indexOf('_count'));
        var tx = '';

        for (var i = 0; i < count; i++) {
            const part = await this.getValueForKey(address, identifier + '_' + i);

            tx += part;
        }

        return JSON.parse(tx);
    }

    async getValueForKey(address, key) {
        const response = await fetch(config.node + '/addresses/data/' + address + '/' + key);
        const responseJSON = await response.json();

        return responseJSON.value;
    }

    async getTransactionsForAddress(address) {
        const transactionsResponse = await fetch(config.node + '/addresses/data/' + address + '?matches=.%2A_count');
        const transactionCounts = await transactionsResponse.json();
        const transactions = [];

        for (var i = 0; i < transactionCounts.length; i++) {
            const transactionCount = transactionCounts[i];
            const tx = await this.getTransaction(transactionCount, address);

            transactions.push(tx);
        }

        return transactions;
    }

}