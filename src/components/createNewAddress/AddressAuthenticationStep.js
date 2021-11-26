import React from "react";

import { Button } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

export default class AddressAuthenticationStep extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.setParentState = props.setState;
        this.state = {
            address: ''
        };
    }

    async authenticateAddress() {
        const signer = new Signer({ NODE_URL: 'https://nodes-testnet.wavesnodes.com' });
        signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'));

        const loginData = await signer.login();
        const address = loginData.address;
        const publicKey = loginData.publicKey;
        this.setState({ address: address, publicKey: publicKey });
        this.setParentState({ addresses: [ {
            address: address,
            publicKey: publicKey
        }] });
    }

    nameChanged(event) {
        const name = event.target.value;

        localStorage.setItem(this.state.address, name);
    }

    render() {

        return (
            <section>
                <h6>First, the address that will be transformed into a multisig address needs to be authenticated.</h6>
                <p />
                <br />
                <br />
                <div className="row">
                    <div className="col-lg-4 mb-2">
                        <div className="form-group mb-3">
                            <label className="text-label">New multisig address</label>
                            <input
                                type="text"
                                name="address"
                                className="form-control"
                                placeholder=""
                                value = { this.state.address }
                                readOnly="false"
                                required
                            />
                        </div>
                    </div>
                    <div className="col-lg-4 mb-2">
                        <div className="form-group mb-3">
                            <label className="text-label">Public key</label>
                            <input
                                type="text"
                                name="publicKey"
                                className="form-control"
                                placeholder={ this.state.publicKey }
                                readOnly="true"
                                required
                            />
                        </div>
                    </div>
                    <div className="col-lg-4 mb-2">
                        <div className="form-group mb-3">
                            <label className="text-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                onChange={ (event) => { this.nameChanged(event); } }
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-3 mb-2">
                        <div className="form-group mb-3">
                            <Button className="me-2" variant="secondary" onClick={ () => { this.authenticateAddress(); }}>
                                Authenticate address
                            </Button>
                        </div>
                    </div>
                </div>
                <p />
            </section>
        );

    }
};

