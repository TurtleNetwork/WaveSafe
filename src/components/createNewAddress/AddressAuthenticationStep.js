import React from "react";

import { Button } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { ProviderKeeper } from '@waves/provider-keeper';

import config from '../../conf/config';

import ReactTooltip from "react-tooltip";

export default class AddressAuthenticationStep extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.setParentState = props.setState;
        this.state = {
            address: ''
        };
    }

    async authenticateAddress() {
        var signer;
/*        if (config.provider === '') {
            signer = new Signer();
            signer.setProvider(new ProviderWeb());
        } else {
            signer = new Signer({ NODE_URL: config.node });
            signer.setProvider(new ProviderWeb(config.provider));
        }*/
        var provider;
        if (config.provider === '') {
            signer = new Signer();
            if (config.wallet === 'signer') {
                provider = new ProviderWeb();
            } else if (config.wallet === 'keeper') {
                provider = new ProviderKeeper();
            }
        } else {
            signer = new Signer({ NODE_URL: config.node });
            if (config.wallet === 'signer') {
                provider = new ProviderWeb(config.provider);
            } else if (config.wallet === 'keeper') {
                provider = new ProviderKeeper();
            }
        }
        signer.setProvider(provider);

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
                        <div className="form-group mb-3" data-tip data-for="newAddressTip">
                            <label className="text-label" >New multisig address</label>
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

                        <ReactTooltip id="newAddressTip" place="top" effect="solid">
                            Enter address that should be turned into multisig here
                        </ReactTooltip>

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
                        <div className="form-group mb-3" data-tip data-for="newAddressTip">
                            <label className="text-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                onChange={ (event) => { this.nameChanged(event); } }
                                required
                            />
                        </div>

                        <ReactTooltip id="nameTip" place="top" effect="solid">
                            Give the address a name in order to better identify it internally
                        </ReactTooltip>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-3 mb-2">
                        <div className="form-group mb-3">
                            <Button className="me-2" variant="secondary" data-tip data-for="newAddressButtonTip" onClick={ () => { this.authenticateAddress(); }}>
                                Authenticate address
                            </Button>
                        </div>

                        <ReactTooltip id="newAddressButtonTip" place="top" effect="solid">
                            Authenticate an address that should be turned into multisig
                        </ReactTooltip>
                    </div>
                </div>
                <p />
            </section>
        );

    }
};

