import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';
import AddressHelper from "../../helpers/AddressHelper"

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class Type11TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            recipients: [],
            assets: [],
            sponsoredAssets: [],
            waves: 0,
            assetToSend: '',
            feeAsset: '',
            fee: 100000,
            showSignedTransaction: false,
            signedTransaction: '',
            message: '',
            showMessageModal: false
        };
        this.modalRef = React.createRef()

        this.addressHelper = new AddressHelper();
        this.getAssets();
    };

    async getAssets() {
        const wavesBalanceResponse = await fetch(config.node + '/addresses/balance/' + this.state.multisigAddress);
        const wavesBalance = await wavesBalanceResponse.json();
        const waves = wavesBalance.balance;
        const assetsResponse = await fetch(config.node + '/assets/balance/' + this.state.multisigAddress);
        const assetsObject = await assetsResponse.json();
        const assets = assetsObject.balances;
        const sponsoredAssets = [];

        assets.forEach(asset => {
            if (asset.minSponsoredAssetFee) {
                sponsoredAssets.push(asset);
            }
        });
        this.setState({ assets: assets, sponsoredAssets: sponsoredAssets, wavesBalance: waves });
    };

    getAssetDecimals(assetId) {
        var decimals = 8;

        this.state.assets.forEach(asset => {
            if (assetId === asset.assetId) {
                decimals =  asset.issueTransaction.decimals;
            }
        });

        return decimals;
    }

    recipientsChanged(event) {
        const recipientsList = event.target.value;
        const lines = recipientsList.split('\n');

        lines.forEach(line => {
            const parts = line.split(';');

            this.state.recipients.push({ recipient: parts[0], amount: parseInt(parts[1]) });
        });
    };

    assetSelected(event) {
        this.setState({ assetToSend: event.target.value });
    };

    async signTransaction() {
        try {
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            var sender = this.state.multisigAddress;
            var transfer = { senderPublicKey: senderPublicKey, sender: sender, transfers: this.state.recipients };
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
                } else if (config.wallet = 'keeper') {
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

            if (this.state.assetToSend !== '') {
                transfer.assetId = this.state.assetToSend;
            }

            const signedMassTransfer = await signer.massTransfer(transfer).sign();
            this.setState({ signedTransaction: signedMassTransfer, showSignedTransaction: true });
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
                } else if (config.wallet = 'keeper') {
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
        var assets = [];

        this.state.assets.forEach(asset => {
            var assetOption = <option value={ asset.assetId }>{ asset.issueTransaction.name } - { asset.assetId }</option>

            assets.push(assetOption);
        });

        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Initialize a mass transfer</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Recipients</label>
                                <textarea
                                    rows="10"
                                    style={{ height: '100%'}}
                                    name="recipients"
                                    className="form-control"
                                    onChange={ (event) => { this.recipientsChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Asset</label>
                                <select
                                    defaultValue={"Select an asset"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.assetSelected(event); } }
                                >
                                    <option value="null">Waves</option>
                                    { assets }
                                </select>
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