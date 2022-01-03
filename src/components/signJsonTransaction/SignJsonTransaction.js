import React, { Fragment } from "react";

import { Button, Modal } from 'react-bootstrap';

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';

export default class SignJsonTransaction extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            jsonTransaction: '',
            signedTransaction: '',
            showSignedTransaction: false
        };
        this.modalRef = React.createRef()
    }

    async signTransaction() {
        const signer = new Signer({ NODE_URL: config.node });

        signer.setProvider(new ProviderWeb(config.provider));

        const signedTransaction = await signer.transfer(JSON.parse(this.state.jsonTransaction)).sign();
        // strange enough: seems like signer is changing data type to string for fee!
        signedTransaction.fee = parseInt(signedTransaction.fee);
        this.setState({ signedTransaction: signedTransaction, showSignedTransaction: true });
    };

    jsonTransactionChanged(event) {
        this.setState({ jsonTransaction: event.target.value });
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    async storeTransaction() {
        var error = false;

        try {
            const wavesDataProtocol = new WavesDataProtocol();
            const txData = wavesDataProtocol.serializeData(this.state.signedTransaction);
            const signer = new Signer({ NODE_URL: config.node });
            const tx = {
                senderPublicKey: this.state.signedTransaction.senderPublicKey,
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

    render() {
        return (
            <Fragment>
                <div className="row">
                    <div className="col-xl-12 col-xxl-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Sign a transaction in JSON</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className="form-group ">
                                        <textarea
                                            className="form-control"
                                            style={{height: "100%"}}
                                            rows="18"
                                            id="jsonTransaction"
                                            onChange={ (event) => { this.jsonTransactionChanged(event); } }
                                        ></textarea>
                                    </div>
                                </form>
                                <br />
                                <Button className="me-2" variant="secondary" onClick={ () => { this.signTransaction(); }}>
                                    Sign transaction
                                </Button>
                            </div>
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

            </Fragment>
        );
    }

}