import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../../conf/config';
import AddressHelper from "../../../helpers/AddressHelper"

import WavesDataProtocol from '../../../dataProtocol/WavesDataProtocol';

import MessageModal from '../../modals/MessageModal';
import PaymentModal from '../../modals/CreatePaymentModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class StakeSURF extends React.Component {

    constructor(props) {
        super(props);

        var multisigWallets = JSON.parse(localStorage.getItem('multisigWallets'));
        var walletNames = {};

        if (!multisigWallets) {
            multisigWallets = [];
        }

        multisigWallets.forEach(multisigWallet => {
            walletNames[multisigWallet] = localStorage.getItem(multisigWallet);
        });


        this.state = {
            multisigAddress: '',
            multisigWallets: multisigWallets,
            walletNames: walletNames,
            amount: 0,
            showSignedTransaction: false,
            signedTransaction: '',
            message: '',
            showMessageModal: false,
            showPaymentModal: false
        };
        this.modalRef = React.createRef();
        this.paymentsModalRef = React.createRef();

        this.addressHelper = new AddressHelper();
    };

    async signTransaction() {
        var dApp = ''
        var surfAssetId = ''

        if (config.network === 'Testnet') {
            dApp = '3N5yarEiTQccnnuerogYT3BxM5Zc5bRgDZy'
            surfAssetId = 'AQHdcKm9R1rBLZRWxFqnvqgGR6GnFqrKsmJCpyNfgiyt';
        } else {
            dApp = '3PBiotFpqjRMkkeFBccnQNUXUopy7KFez5C';
            surfAssetId = 'At8D6NFFpheCbvKVnjVoeLL84Eo8NZn6ovManxfLaFWL';
        }

        try {
            const senderPublicKey = await this.addressHelper.getMultisigPublicKey(this.state.multisigAddress);
            var sender = this.state.multisigAddress;
            var payments = [
                {
                    "amount": (this.state.amount * 1000000),
                    "assetId": surfAssetId
                }
            ]
            var invocation = { senderPublicKey: senderPublicKey, sender: sender, dApp: dApp, payment: payments, call: { function: 'stake', args: [] } };
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

            const signedInvocation = await signer.invoke(invocation).sign();
            this.setState({ signedTransaction: signedInvocation, showSignedTransaction: true });
        } catch(err) {
            console.log(err)
        }
    };

    amountNSBTChanged(event) {
        const amount = parseFloat(event.target.value);
        this.setState({ amount: amount });
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    multisigWalletSelected(event) {
        this.setState({ multisigAddress: event.target.value });
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
        var multisigWalletOptions = [];

        this.state.multisigWallets.forEach(address => {
            var newMultisigOption = <option value={ address }>{ address } - { this.state.walletNames[address] }</option>

            multisigWalletOptions.push(newMultisigOption);
        });

        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Stake NSBT</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Multisig address</label>
                                <select
                                    defaultValue={"Select multisig wallet"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.multisigWalletSelected(event); } }
                                >
                                    <option value="0">Select multisig wallet</option>
                                    { multisigWalletOptions }
                                </select>
                                <br />

                                <label className="text-label">Amount of NSBT to stake</label>
                                <input
                                    type="text"
                                    name="smartContract"
                                    className="form-control"
                                    onChange={ (event) => { this.amountNSBTChanged(event); } }
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

                { this.state && this.state.showPaymentModal ? <PaymentModal ref={ this.paymentsModalRef } parentState={ this.state } setParentState={ state => { this.setState(state) } } assets={ this.state.assets } /> : '' }

            </div>
        );
    };

}