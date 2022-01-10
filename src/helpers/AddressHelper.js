import config from "../conf/config";

export default class AddressHelper {

    async getMultisigPublicKey(address) {
        const multisigPublicKeyResponse = await fetch(config.node + '/addresses/data/' + address + '/publicKey');
        const multisigPublicKey = await multisigPublicKeyResponse.json();

        return multisigPublicKey.value;
    }

}