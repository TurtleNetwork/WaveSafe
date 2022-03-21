import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';
import AddressHelper from "../../helpers/AddressHelper"

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';

export default class Type15TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            assetId: '',
            script: null,
            showSignedTransaction: false,
            signedTransaction: '',
            message: '',
            showMessageModal: false
        };
        this.modalRef = React.createRef()

        this.addressHelper = new AddressHelper();
    };

    assetIdChanged(event) {
        this.setState({ assetId: event.target.value });
    };

    scriptChanged(event) {
        this.compileScript(event.target.value, compiledContract => {
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

    async signTransaction() {
        try {
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            var sender = this.state.multisigAddress;
            var setAssetScript = { senderPublicKey: senderPublicKey, sender: sender, assetId: this.state.assetId, script: this.state.script };
            var signer;
            if (config.provider === '') {
                signer = new Signer();
                signer.setProvider(new ProviderWeb());
            } else {
                signer = new Signer({ NODE_URL: config.node });
                signer.setProvider(new ProviderWeb(config.provider));
            }

            const signedSetAssetScript = await signer.setAssetScript(setAssetScript).sign();
            this.setState({ signedTransaction: signedSetAssetScript, showSignedTransaction: true });
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
            if (config.provider === '') {
                signer = new Signer();
                signer.setProvider(new ProviderWeb());
            } else {
                signer = new Signer({ NODE_URL: config.node });
                signer.setProvider(new ProviderWeb(config.provider));
            }

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
                            <h4 className="card-title">Set asset script</h4>
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
                                    name="recipient"
                                    className="form-control"
                                    onChange={ (event) => { this.assetIdChanged(event); } }
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