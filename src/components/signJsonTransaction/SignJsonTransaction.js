import React, { Fragment } from "react";

import { Button, Modal } from 'react-bootstrap';

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

export default class SignJsonTransaction extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            jsonTransaction: '',
            signedTransaction: '',
            showSignedTransaction: false
        };
    }

    async signTransaction() {
        const signer = new Signer({ NODE_URL: 'https://nodes-testnet.wavesnodes.com' });

        signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'));

        const signedTransaction = await signer.transfer(JSON.parse(this.state.jsonTransaction)).sign();
        this.setState({ signedTransaction: signedTransaction, showSignedTransaction: true });
    };

    jsonTransactionChanged(event) {
        this.setState({ jsonTransaction: event.target.value });
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

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
                            variant="danger light"
                            onClick={() => this.closeModal() }
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Fragment>
        );
    }

}