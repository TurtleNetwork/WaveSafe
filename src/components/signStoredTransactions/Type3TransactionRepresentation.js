import React from 'react';

import { Button, Modal, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class Type3TransactionRepresentation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tx: props.tx,
            decompiledScript: ''
        };
        this.modalRef = React.createRef()

        this.decompileScript(props.tx.script, decompiledScript => {
            this.setState({ decompiledScript: decompiledScript });
        });
    };

    async setTx(tx) {
        this.setState({ tx: tx });
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

            /*const oldId = this.state.tx.id;
            const issueTransaction = await signer.issue(this.state.tx).sign();
            issueTransaction.id = oldId;*/
            const oldId = this.state.tx.id;
            var oldProofs = this.state.tx.proofs;
            var issueTransaction = await signer.issue(this.state.tx).sign();
            if (Array.isArray(issueTransaction)) {
                issueTransaction = issueTransaction[0];
            }
            issueTransaction.id = oldId;
            if (issueTransaction.proofs.length === 1) {
                oldProofs.push(issueTransaction.proofs[0]);
                issueTransaction.proofs = oldProofs;
            }

            this.setState({ signedTransaction: issueTransaction, showSignedTransaction: true });
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

            //signer.setProvider(new ProviderWeb(config.provider));
            var provider;
            var signer;
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

    decompileScript(base64Script, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open("POST", config.node + "/utils/script/decompile", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const scriptObject = JSON.parse(this.response);
                const decompiledScript = scriptObject.script;

                callback(decompiledScript);
            }
        };
        xhr.send(base64Script);
    };

    render() {
         return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Token to issue</h4>
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
                                        <td>Name</td>
                                        <td>{ this.state.tx.name }</td>
                                    </tr>
                                    <tr key="2">
                                        <td>Description</td>
                                        <td>{ this.state.tx.description }</td>
                                    </tr>
                                    <tr key="3">
                                        <td>Quantity</td>
                                        <td>{ this.state.tx.quantity }</td>
                                    </tr>
                                    <tr key="4">
                                        <td>Decimals</td>
                                        <td>{ this.state.tx.decimals }</td>
                                    </tr>
                                    <tr key="5">
                                        <td>Reissuable</td>
                                        <td>{ "" + this.state.tx.reissuable }</td>
                                    </tr>
                                    <tr key="6">
                                        <td>Script</td>
                                        <td>{ this.state.decompiledScript }</td>
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