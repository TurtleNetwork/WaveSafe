import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';
import AddressHelper from "../../helpers/AddressHelper"

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class Type14TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            assetId: '',
            decimals: 0,
            sponsoringAmount: 0,
            signedTransaction: '',
            message: '',
            showMessageModal: false
        };
        this.modalRef = React.createRef()

        this.addressHelper = new AddressHelper();
    };

    async assetIdChanged(event) {
        const assetId = event.target.value;
        const decimals = await this.getAssetDecimals(assetId);

        this.setState({ assetId: assetId, decimals: decimals });
    };

    async getAssetDecimals(assetId) {
        const assetInfo = await fetch(config.node + '/assets/details/' + assetId);
        const assetInfoJSON = await assetInfo.json();

        return assetInfoJSON.decimals;
    }

    sponsoringChanged(event) {
        this.setState({ sponsoringAmount: parseFloat(event.target.value) });
    }

    async signTransaction() {
        try {
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            var sender = this.state.multisigAddress;
            var sponsor = { senderPublicKey: senderPublicKey, sender: sender, assetId: this.state.assetId, minSponsoredAssetFee: this.state.sponsoringAmount * Math.pow(10, this.state.decimals) };
            var signer;
            /*if (config.provider === '') {
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

            var signedSponsoring = await signer.sponsorship(sponsor).sign();
            if (Array.isArray(signedSponsoring)) {
                signedSponsoring = signedSponsoring[0];
            }

            this.setState({ signedTransaction: signedSponsoring, showSignedTransaction: true });
        } catch(err) { }
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    async storeTransaction() {
        var error = false;

        try {
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            const wavesDataProtocol = new WavesDataProtocol();
            const txData = wavesDataProtocol.serializeData(this.state.signedTransaction);
            const tx = {
                senderPublicKey: senderPublicKey,
                data: txData
            };
            var signer;
            /*if (config.provider === '') {
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

            await signer.data(tx).broadcast();
        } catch(err) {
            this.setState({ message: err.message, showMessageModal: true });
            if (this.modalRef.current) {
                this.modalRef.current.activateModal(this.state.message);
            }
            error = true;
        }
        if (!error) {
            this.setState({ message: 'Transaction successfully stored!', showMessageModal: true });
            if (this.modalRef.current) {
                this.modalRef.current.activateModal(this.state.message);
            }
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Create alias</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Asset ID</label>
                                <input
                                    type="text"
                                    name="assetId"
                                    className="form-control"
                                    onChange={ (event) => { this.assetIdChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Min. sponsored asset fee</label>
                                <input
                                    type="number"
                                    name="minSponsoredAssetFee"
                                    className="form-control"
                                    onChange={ (event) => { this.sponsoringChanged(event); } }
                                    required
                                />
                                <br />
                                <Button className="me-2" variant="secondary" onClick={ () => { this.signTransaction(); }}>
                                    Sign transaction
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                <Modal className="fade bd-example-modal-lg" size="lg" show={ this.state.showSignedTransaction }>
                    <Modal.Header>
                        <Modal.Title>The signed transaction</Modal.Title>
                        <Button
                            variant=""
                            className="btn-close"
                            onClick={() => this.closeModal()}
                        >
                        </Button>
                    </Modal.Header>
                    <Modal.Body>
                        <pre>{ JSON.stringify(this.state.signedTransaction, 0, 4) }</pre>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary light"
                            onClick={() => this.storeTransaction() }
                        >
                            Store transaction
                        </Button>
                        <Button
                            variant="danger light"
                            onClick={() => this.closeModal() }
                        >
                            Close
                        </Button>

                    </Modal.Footer>
                </Modal>

                { this.state && this.state.showMessageModal ? <MessageModal ref={ this.modalRef } message={ this.state.message } /> : ''}

            </div>
        );
    };

}