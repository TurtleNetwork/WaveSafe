import React from 'react';

import { Button, Modal, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';

export default class Type11TransactionRepresentation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tx: '',
            assetName: '',
            assetDecimals: 0,
        };
        this.modalRef = React.createRef()

        this.setTx(props.tx);
    };

    async setTx(tx) {
        const assetName = await this.getAssetName(tx.assetId);
        const assetDecimals = await this.getAssetDecimal(tx.assetId);

        this.setState({ tx: tx, assetName: assetName, assetDecimals: assetDecimals });
    }

    async signTransaction() {
        try {
            const signer = new Signer({ NODE_URL: config.node });
            signer.setProvider(new ProviderWeb(config.provider));

            const oldId = this.state.tx.id;
            const signedMassTransfer = await signer.massTransfer(this.state.tx).sign();
            signedMassTransfer.id = oldId;
            this.setState({ signedTransaction: signedMassTransfer, showSignedTransaction: true });
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
            const signer = new Signer({ NODE_URL: config.node });
            const tx = {
                senderPublicKey: senderPublicKey,
                data: txData
            };

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
        var transfersElements = [];
        if (this.state.tx.transfers) {
            this.state.tx.transfers.forEach(transfer => {
                transfersElements.push(<div> {transfer.recipient + '; ' + transfer.amount } </div>);
            });
        }

         return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Mass transfer transaction to sign</h4>
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
                                        <td>Recipients</td>
                                        <td>{ transfersElements }</td>
                                    </tr>
                                    <tr key="2">
                                        <td>Asset</td>
                                        <td>{ this.state.assetName }</td>
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