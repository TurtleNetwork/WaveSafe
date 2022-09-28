import React from 'react';

import { Button, Modal, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class Type6TransactionRepresentation extends React.Component {

    constructor(props) {
        super(props);


        this.state = {
            tx: props.tx,
            decimals: 0
        };
        this.modalRef = React.createRef()
        this.getAssetDecimals(props.tx.assetId);
    };

    async getAssetDecimals(assetId) {
        const assetInfo = await fetch(config.node + '/assets/details/' + assetId);
        const assetInfoJSON = await assetInfo.json();

        this.setState({ decimals: assetInfoJSON.decimals });
    }

    async setTx(tx) {
        this.setState({ tx: tx });
    }

    async signTransaction() {
        try {
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

            const oldId = this.state.tx.id;
            const burnTransaction = await signer.burn(this.state.tx).sign();
            burnTransaction.id = oldId;
            this.setState({ signedTransaction: burnTransaction, showSignedTransaction: true });
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
         return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Tokens to burn</h4>
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
                                        <td>Asset ID</td>
                                        <td>{ this.state.tx.assetId }</td>
                                    </tr>
                                    <tr key="2">
                                        <td>Quantity</td>
                                        <td>{ this.state.tx.amount / Math.pow(10, this.state.decimals) }</td>
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