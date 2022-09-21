import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';
import AddressHelper from "../../helpers/AddressHelper"

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import MessageModal from '../modals/MessageModal';
import PaymentModal from '../modals/CreatePaymentModal';

export default class Type4TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            contractAddress: '',
            callables: [],
            amount: 0,
            payments: [],
            assets: [],
            sponsoredAssets: [],
            parameters: [],
            parameterValues: [],
            waves: 0,
            functionToCall: '',
            feeAsset: '',
            showSignedTransaction: false,
            signedTransaction: '',
            message: '',
            showMessageModal: false,
            showPaymentModal: false
        };
        this.modalRef = React.createRef();
        this.paymentsModalRef = React.createRef();

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

    async contractAddressChanged(event) {
        const smartContract = event.target.value;
        const callables = await this.getCallables(smartContract);
        this.setState({ contractAddress: smartContract, callables: callables });
    };

    async getCallables(smartContract) {
        const callablesResult = await fetch(config.node + '/addresses/scriptInfo/' + smartContract + '/meta');
        const callablesJson = await callablesResult.json();

        return callablesJson.meta.callableFuncTypes;
    };

    parameterChanged(event) {
        const field = parseInt(event.target.name);
        const value = event.target.value;
        var parameters = this.state.parameterValues;

        parameters[field] = value;
        this.setState({ parameterValues: parameters });
    };

    callableSelected(event) {
        const functionToCall = event.target.value;
        const parameters = this.state.callables[functionToCall]

        this.setState({ functionToCall: functionToCall, parameters: parameters });
    }

    feeAssetSelected(event) {
        var feeAsset = event.target.value;

        if (feeAsset === 'null') {
            feeAsset = null;
        }

        this.setState({ feeAsset: feeAsset });
    };

    async signTransaction() {
        try {
            var args = [];
            var i = 0;
            this.state.parameters.forEach(parameter => {
                var entry;
                if (parameter.type === 'String') {
                    entry = {
                        type: 'string',
                        value: this.state.parameterValues[i]
                    };
                } else if (parameter.type === 'Binary') {
                    entry = {
                        type: 'binary',
                        value: this.state.parameterValues[i]
                    };
                } else if (parameter.type === 'Int') {
                    entry = {
                        type: 'integer',
                        value: parseInt(this.state.parameterValues[i])
                    };
                } else if (parameter.type === 'Boolean') {
                    entry = {
                        type: 'boolean',
                        value: this.state.parameterValues[i]
                    };
                }
                args.push(entry);
                i++;
            });
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            var sender = this.state.multisigAddress;
            var invocation = { senderPublicKey: senderPublicKey, sender: sender, dApp: this.state.contractAddress, payment: this.state.payments, call: {
                function: this.state.functionToCall,
                args: args
            } };
            var signer;
            if (config.provider === '') {
                signer = new Signer();
                signer.setProvider(new ProviderWeb());
            } else {
                signer = new Signer({ NODE_URL: config.node });
                signer.setProvider(new ProviderWeb(config.provider));
            }

            if (this.state.feeAsset !== '') {
                invocation.feeAssetId = this.state.feeAsset;
            }
            const signedInvocation = await signer.invoke(invocation).sign();
            this.setState({ signedTransaction: signedInvocation, showSignedTransaction: true });
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

    getNewPayment() {
        this.setState({ showPaymentModal: true });
        if (this.paymentsModalRef.current) {
            this.paymentsModalRef.current.activateModal(this.state.assets);
        }
    };

    getAssetName(assetId) {
        var name = '';

        if (assetId === null) {
            name = 'Waves'
        } else {
            this.state.assets.forEach(asset => {
                if (asset.assetId === assetId) {
                    name = asset.issueTransaction.name;
                }
            });
        }

        return name;
    };

    render() {
        var sponsoredAssets = [];
        var callableFunctions = [];
        var parameterList = [];
        var paymentInfos = [];

        var j = 0;
        this.state.payments.forEach(payment => {
            var name = this.getAssetName(payment.assetId);
            var decimals = this.getAssetDecimals(payment.assetId);
            var paymentInfo =  <div>
                <label className="text-label">Payment { j + 1 } </label>
                <pre> { payment.amount / Math.pow(10, decimals) + ' ' + name }</pre>
                <br />
            </div>

            paymentInfos.push(paymentInfo);
            j++;
        });
        for (const key of Object.keys(this.state.callables)) {
            var callableOption = <option value={ key }>{ key }</option>;

            callableFunctions.push(callableOption);
        }
        this.state.sponsoredAssets.forEach(asset => {
            var assetOption = <option value={ asset.assetId }>{ asset.issueTransaction.name } - { asset.assetId }</option>

            sponsoredAssets.push(assetOption);
        });
        var i = 0;
        this.state.parameters.forEach(parameter => {
            var parameterEntry;
            if (parameter.type === 'String' || parameter.type === 'Binary') {
                parameterEntry = <div>
                                    <label className="text-label">Parameter: { parameter.name } </label>
                                    <input
                                        type="text"
                                        name={ i }
                                        className="form-control"
                                        onChange={ (event) => { this.parameterChanged(event); } }
                                        required
                                    />
                                    <br />
                                </div>
            } else if (parameter.type === 'Int') {
                parameterEntry = <div>
                    <label className="text-label">Parameter: { parameter.name } </label>
                    <input
                        type="number"
                        name={ i }
                        className="form-control"
                        onChange={ (event) => { this.parameterChanged(event); } }
                        required
                    />
                    <br />
                </div>
            } else if (parameter.type === 'Boolean') {
                parameterEntry = <div>
                    <label className="text-label">Parameter: {parameter.name} </label>
                    <select
                        defaultValue={"Select a value"}
                        className="form-control form-control-lg"
                        name={ i }
                        onChange={ (event) => { this.parameterChanged(event); } }
                    >
                        <option value="">Select a value</option>;
                        <option value={ true }>true</option>;
                        <option value={ false }>false</option>;
                    </select>
                </div>
            }
            parameterList.push(parameterEntry);
            i++;
        });

        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Invoke a smart contract function</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Smart Contract</label>
                                <input
                                    type="text"
                                    name="smartContract"
                                    className="form-control"
                                    onChange={ (event) => { this.contractAddressChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Fee asset</label>
                                <select
                                    defaultValue={"Select an asset as fee"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.feeAssetSelected(event); } }
                                >
                                    <option value="null">Waves</option>
                                    { sponsoredAssets }
                                </select>
                                <br />
                                <label className="text-label">Function to call</label>
                                <select
                                    defaultValue={"Select a function to call"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.callableSelected(event); } }
                                >
                                    { callableFunctions }
                                </select>
                                <br />
                                { parameterList.length > 0 ? parameterList : null}
                                { paymentInfos }
                                <Button className="me-2" variant="primary" onClick={ () => { this.getNewPayment(); }} disabled={ this.state.payments.length > 9 }>
                                    Add payment
                                </Button>
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

                { this.state && this.state.showPaymentModal ? <PaymentModal ref={ this.paymentsModalRef } parentState={ this.state } setParentState={ state => { this.setState(state) } } assets={ this.state.assets } /> : '' }

            </div>
        );
    };

}