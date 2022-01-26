import React from 'react';

import { Button, Modal, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';

export default class Type16TransactionRepresentation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tx: props.tx,
            feeAssetName: 'Waves',
            paymentsAssetNames: [],
            decimals: []
        };
        this.setTx(props.tx);
        this.modalRef = React.createRef()
    };

    async setTx(tx) {
        var paymentsAssetNames = [];
        var decimals = [];
        const feeAssetName = await this.getAssetName(tx.feeAssetId);

        for (var i = 0; i < tx.payment.length; i++) {
            const payment = tx.payment[i];
            const assetName = await this.getAssetName(payment.assetId);
            const assetDecimals = await this.getAssetDecimals(payment.assetId);

            paymentsAssetNames.push(assetName);
            decimals.push(assetDecimals);
        };
        this.setState({ tx: tx, feeAssetName: feeAssetName, paymentsAssetNames: paymentsAssetNames, decimals: decimals });
    }

    async signTransaction() {
        try {
            const signer = new Signer({ NODE_URL: config.node });
            signer.setProvider(new ProviderWeb(config.provider));

            const oldId = this.state.tx.id;
            const signedInvoke = await signer.invoke(this.state.tx).sign();
            signedInvoke.id = oldId;
            this.setState({ signedTransaction: signedInvoke, showSignedTransaction: true });
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

    async getAssetDecimals(assetId) {
        var decimals = 8;

        if (assetId !== null) {
            const assetInfo = await fetch(config.node + '/transactions/info/' + assetId);
            const assetInfoJson = await assetInfo.json();

            decimals = assetInfoJson.decimals;
        }

        return decimals;
    };


    async getAssetName(assetId) {
        var assetName = 'Waves';

        if (assetId !== null) {
            const assetInfo = await fetch(config.node + '/transactions/info/' + assetId);
            const assetInfoJson = await assetInfo.json();

            assetName = assetInfoJson.name;
        }

        return assetName;
    };

    render() {
        var parametersInfo = [];
        var paymentsInfo = [];

        if (this.state.tx) {
            var i = 0;
            this.state.tx.call.args.forEach(arg => {
                const argEntry = <tr key={ 'arg_' + i }>
                    <td>Parameter { i + 1}</td>
                    <td>{ arg.value }</td>
                </tr>
                parametersInfo.push(argEntry);
                i++;
            });
            i = 0;
            this.state.tx.payment.forEach(payment => {
                const paymentEntry =   <tr key={ 'pay_' + i }>
                    <td>Payment { i + 1}</td>
                    <td>{ (payment.amount / Math.pow(10, this.state.decimals[i])) + ' ' + this.state.paymentsAssetNames[i] }</td>
                </tr>
                paymentsInfo.push(paymentEntry);
                i++;
            });
        }

         return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Invoke script</h4>
                        </div>
                        <div className="card-body">
                            <Table responsive>
                                <thead>
                                <tr>
                                    <th className="width110">
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
                                        <td>Smart contract</td>
                                        <td>{ this.state.tx.dApp }</td>
                                    </tr>
                                    <tr key="2">
                                        <td>Fee asset</td>
                                        <td>{ this.state.feeAssetName }</td>
                                    </tr>
                                    <tr key="3">
                                        <td>Function</td>
                                        <td>{ this.state.tx.call.function }</td>
                                    </tr>
                                    { parametersInfo }
                                    { paymentsInfo }
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