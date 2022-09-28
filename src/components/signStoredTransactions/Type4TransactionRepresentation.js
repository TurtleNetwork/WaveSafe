import React from 'react';

import { Button, Modal, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class Type4TransactionRepresentation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tx: '',
            assetName: '',
            feeAssetName: '',
            assetDecimals: 0,
            feeAssetDecimals: 0
        };
        this.modalRef = React.createRef()

        this.setTx(props.tx);
    };

    async setTx(tx) {
        const assetName = await this.getAssetName(tx.assetId);
        const feeAssetName = await this.getAssetName(tx.feeAssetId);
        const assetDecimals = await this.getAssetDecimal(tx.assetId);
        const feeAssetDecimals = await this.getAssetDecimal(tx.feeAssetId);

        this.setState({ tx: tx, assetName: assetName, feeAssetName: feeAssetName, assetDecimals: assetDecimals, feeAssetDecimals: feeAssetDecimals });
    }

    async signTransaction() {
        try {
            //const signer = new Signer({ NODE_URL: config.node });
            //signer.setProvider(new ProviderWeb(config.provider));
            var signer;
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

            const oldId = this.state.tx.id;
            const signedTransfer = await signer.transfer(this.state.tx).sign();
            signedTransfer.fee = parseInt(signedTransfer.fee);
            signedTransfer.id = oldId;
            console.log(signedTransfer);
            this.setState({ signedTransaction: signedTransfer, showSignedTransaction: true });
        } catch(err) { }
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    async storeTransaction() {
        var error = false;

        try {
            const senderPublicKey = this.state.tx.senderPublicKey;
            const wavesDataProtocol = new WavesDataProtocol();
            const txData = wavesDataProtocol.serializeData(this.state.signedTransaction);
            //const signer = new Signer({ NODE_URL: config.node });
            const tx = {
                senderPublicKey: senderPublicKey,
                data: txData
            };
            var signer;
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

            signer.setProvider(new ProviderWeb(config.provider));

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

    async getAssetName(assetId) {
        var name = '';

        if (!assetId) {
            name = 'WAVES';
        } else {
            const assetResponse = await fetch(config.node + '/assets/details/' + assetId);
            const asset = await assetResponse.json();

            name = asset.name;
        }

        return name;
    }

    async getAssetDecimal(assetId) {
        var decimals = 0;

        if (!assetId) {
            decimals = 8;
        } else {
            const assetResponse = await fetch(config.node + '/assets/details/' + assetId);
            const asset = await assetResponse.json();

            decimals = asset.decimals;
        }

        return decimals;
    }

    render() {
         return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Transfer transaction to sign</h4>
                        </div>
                        <div className="card-body">
                            <Table responsive>
                                <thead>
                                <tr>
                                    <th className="width80">
                                        <strong>Field</strong>
                                    </th>
                                    <th>
                                        <strong>Value</strong>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr key="0">
                                        <td>Id</td>
                                        <td>{ this.state.tx.id }</td>
                                    </tr>
                                    <tr key="1">
                                        <td>Recipient</td>
                                        <td>{ this.state.tx.recipient }</td>
                                    </tr>
                                    <tr key="2">
                                        <td>Amount</td>
                                        <td>{ this.state.tx.amount / Math.pow(10, this.state.assetDecimals) }</td>
                                    </tr>
                                    <tr key="3">
                                        <td>Asset</td>
                                        <td>{ this.state.assetName }</td>
                                    </tr>
                                    <tr key="4">
                                        <td>Fee asset</td>
                                        <td>{ this.state.feeAssetName }</td>
                                    </tr>
                                    <tr key="5">
                                        <td>Fee</td>
                                        <td>{ this.state.tx.fee / Math.pow(10, this.state.feeAssetDecimals) }</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <br />
                            <Button className="me-2" variant="secondary" onClick={ () => { this.signTransaction(); }}>
                                Sign transaction
                            </Button>
                        </div>
                    </div>
                </div>

                <Modal className="fade bd-example-modal-lg" size="lg" show={ this.state.showSignedTransaction }>
                    <Modal.Header>
                        <Modal.Title>Modal title</Modal.Title>
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