import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';
import AddressHelper from "../../helpers/AddressHelper"

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';

export default class Type3TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            name: '',
            decimals: 0,
            quantity: 0,
            reissuable: false,
            description: '',
            script: '',
            showSignedTransaction: false,
            signedTransaction: '',
            message: '',
            showMessageModal: false
        };
        this.modalRef = React.createRef()

        this.addressHelper = new AddressHelper();
    };

    nameChanged(event) {
        this.setState({ name: event.target.value });
    };

    descriptionChanged(event) {
        this.setState({ description: event.target.value });
    };

    scriptChanged(event) {
        this.compileScript(event.target.value, compiledContract => {
            console.log(compiledContract);
            if (compiledContract.startsWith('base64:')) {
                this.setState({ script: compiledContract });
            }
        });
    };

    compileScript(script, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open("POST", config.node + "/utils/script/compileCode", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const scriptObject = JSON.parse(this.response);
                const compiledScript = scriptObject.script;

                callback(compiledScript);
            }
        };
        xhr.send(script);
    };

    decimalsSelected(event) {
        this.setState({ decimals: parseInt(event.target.value) });
    };

    reissuableSelected(event) {
        var reissuableString = event.target.value;
        var reissuable;

        if (reissuableString === 'true') {
            reissuable = true;
        } else if (reissuableString === 'false') {
            reissuable = false;
        }

        this.setState({ reissuable: reissuable });
    };

    quantityChanged(event) {
        const quantity = parseFloat(event.target.value);

        this.setState({ quantity: quantity });
    };

    async signTransaction() {
        //try {
            const signer = new Signer({ NODE_URL: config.node });
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);

            console.log(senderPublicKey);
            var sender = this.state.multisigAddress;
            var issue = { senderPublicKey: senderPublicKey, sender: sender, name: this.state.name, decimals: this.state.decimals, quantity: this.state.quantity, reissuable: this.state.reissuable, description: this.state.description, script: this.state.script };

            signer.setProvider(new ProviderWeb(config.provider));

            const signedIssue = await signer.issue(issue).sign();
            // strange enough: seems like signer is changing data type to string for fee!
            //signedIssue.fee = parseInt(this.state.fee);
            this.setState({ signedTransaction: signedIssue, showSignedTransaction: true });
        //} catch(err) { }
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

    render() {
        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Issue a new token</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Name</label>
                                <input
                                    type="text"
                                    name="recipient"
                                    className="form-control"
                                    onChange={ (event) => { this.nameChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Decimals</label>
                                <select
                                    defaultValue={"number of decimals"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.decimalsSelected(event); } }
                                >
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                </select>
                                <br />
                                <label className="text-label">Quantity</label>
                                <input
                                    type="text"
                                    name="quantity"
                                    className="form-control"
                                    onChange={ (event) => { this.quantityChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Reissuable</label>
                                <select
                                    defaultValue={"Reissuable"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.reissuableSelected(event); } }
                                >
                                    <option value="false">false</option>
                                    <option value="true">true</option>
                                </select>
                                <br />
                                <label className="text-label">Description</label>
                                <textarea
                                    rows="4"
                                    style={{ height: '100%'}}
                                    name="description"
                                    className="form-control"
                                    onChange={ (event) => { this.descriptionChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Script</label>
                                <textarea
                                    rows="10"
                                    style={{ height: '100%'}}
                                    name="script"
                                    className="form-control"
                                    onChange={ (event) => { this.scriptChanged(event); } }
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