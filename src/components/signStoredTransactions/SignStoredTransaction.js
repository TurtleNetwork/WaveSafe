import React, { Fragment } from "react";

import Type3TransactionRepresentation from "./Type3TransactionRepresentation";
import Type4TransactionRepresentation from "./Type4TransactionRepresentation";
import Type5TransactionRepresentation from "./Type5TransactionRepresentation";
import Type6TransactionRepresentation from "./Type6TransactionRepresentation";
import Type8TransactionRepresentation from "./Type8TransactionRepresentation";
import Type9TransactionRepresentation from "./Type9TransactionRepresentation";
import Type11TransactionRepresentation from "./Type11TransactionRepresentation";
import Type13TransactionRepresentation from "./Type13TransactionRepresentation";
import Type14TransactionRepresentation from "./Type14TransactionRepresentation";
import Type15TransactionRepresentation from "./Type15TransactionRepresentation";
import Type16TransactionRepresentation from "./Type16TransactionRepresentation";

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import { Button, Table } from "react-bootstrap";

import config from '../../conf/config';

import MessageModal from '../modals/MessageModal';
import {ProviderKeeper} from "@waves/provider-keeper";

export default class SignStoredTransaction extends React.Component {

    constructor(props) {
        super(props);
        var multisigWallets = JSON.parse(localStorage.getItem('multisigWallets'));
        var walletNames = {};

        if (!multisigWallets) {
            multisigWallets = [];
        }

        this.selectedTransactionComponentRef = React.createRef();

        multisigWallets.forEach(multisigWallet => {
            walletNames[multisigWallet] = localStorage.getItem(multisigWallet);
        });

        this.modalRef = React.createRef()

        this.state = {
            multisigWallets: multisigWallets,
            multisigAddress: '',
            walletNames: walletNames,
            transactions: [],
            selectedTransaction: null,
            necessarySignaturesForAddress: 1000000,
            selectedTransactionComponent: null
        };
    }

    componentDidMount() {
        var parent = this;
        this.interval = setInterval(async function() {
            await parent.multisigWalletSelectedInterval();
            parent.setState({ time: Date.now() });
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    transactionSelected(tx) {
        var selectedTransactionComponent;

        if (tx.type === 3) {
            selectedTransactionComponent = <Type3TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 4) {
            selectedTransactionComponent = <Type4TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 5) {
            selectedTransactionComponent = <Type5TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 6) {
            selectedTransactionComponent = <Type6TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 8) {
            selectedTransactionComponent = <Type8TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 9) {
            selectedTransactionComponent = <Type9TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 11) {
            selectedTransactionComponent = <Type11TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 13) {
            selectedTransactionComponent = <Type13TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 14) {
            selectedTransactionComponent = <Type14TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 15) {
            selectedTransactionComponent = <Type15TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        } else if (tx.type === 16) {
            selectedTransactionComponent = <Type16TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ tx } />;
        }
        this.setState({ selectedTransaction: tx, selectedTransactionComponent: selectedTransactionComponent });
    };

    async multisigWalletSelected(event) {
        const dataProtocol = new WavesDataProtocol();
        const address = event.target.value;
        console.log(address);
        const transactions = await dataProtocol.getTransactionsForAddress(address);
        const necessarySignaturesForAddressResponse = await fetch(config.node + '/addresses/data/' + address + '/necessarySignatures');
        const necessarySignaturesForAddressJSON = await necessarySignaturesForAddressResponse.json();
        const necessarySignaturesForAddress = necessarySignaturesForAddressJSON.value;

        this.setState({ multisigAddress: address, transactions: transactions, necessarySignaturesForAddress: necessarySignaturesForAddress, selectedTransactionComponent: null });
    };

    async multisigWalletSelectedInterval() {
        const dataProtocol = new WavesDataProtocol();
        const address = this.state.multisigAddress;
        const transactions = await dataProtocol.getTransactionsForAddress(address);
        const necessarySignaturesForAddressResponse = await fetch(config.node + '/addresses/data/' + address + '/necessarySignatures');
        const necessarySignaturesForAddressJSON = await necessarySignaturesForAddressResponse.json();
        const necessarySignaturesForAddress = necessarySignaturesForAddressJSON.value;

        this.setState({ transactions: transactions, necessarySignaturesForAddress: necessarySignaturesForAddress });
    };

    async deleteTransaction(tx) {
        await this.deleteTransactionEntry(tx.id, tx.senderPublicKey);
    }

    // TODO: should be changed to real deletion of the entries once we understood how to do that with signer. :)
    async deleteTransactionEntry(id, senderPublicKey) {
        //const transactionCountResponse = await fetch(config.node + '/addresses/data/' + this.state.multisigAddress + '/' + id + '_count');
        //const transactionCountJSON = await transactionCountResponse.json();
        //const transactionCount = transactionCountJSON.value;

        try {
            const txData = [
                {
                    key: id + '_count',
                    type: 'integer',
                    value: -1
                }
            ];
            /*for (var i = 0; i < transactionCount; i++) {
             txData.push({
             key: id + '_' + i
             });
             }*/
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
            console.log(err);
        }
    }

    async broadcast(tx) {
        var message = '';
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

            await signer.broadcast(tx);

            message = 'Transaction sucessfully broadcasted!';
        } catch(err) {
            message = err.message;
        }
        this.setState({ message: message, showMessageModal: true });
        if (this.modalRef.current) {
            this.modalRef.current.activateModal(message);
        }
        this.deleteTransactionEntry(tx.id, tx.senderPublicKey);
    }

    render() {
        if (this.selectedTransactionComponentRef.current) {
            this.selectedTransactionComponentRef.current.setTx(this.state.selectedTransaction);
        }
        const map = {
            '3': 'Issue',
            '4': 'Transfer',
            '5': 'Reissue',
            '6': 'Burn',
            '8': 'Lease',
            '9': 'Cancel lease',
            '10': 'Alias',
            '11': 'Mass transfer',
            '13': 'Set script',
            '14': 'Sponsor asset',
            '15': 'Set asset script',
            '16': 'Invoke script'
        };
        var multisigWalletOptions = [];

        this.state.multisigWallets.forEach(address => {
            var newMultisigOption = <option value={ address }>{ address } - { this.state.walletNames[address] }</option>

            multisigWalletOptions.push(newMultisigOption);
        });

        var transactionsTableEntries  = [];
        var i = 0;

        this.state.transactions.forEach((tx) => {
            var broadcastButton;

            if (tx.proofs.length >= this.state.necessarySignaturesForAddress) {
                broadcastButton = <Button className="me-2" id={ 'broadcast_' + i } variant="secondary btn-rounded" onClick={ (event) => { this.broadcast(tx) } }>
                                    <span className="btn-icon-start text-primary">
                                        <i className="fa fa-share" />
                                    </span>
                                    Broadcast
                                </Button>;
            } else {
                broadcastButton = '';
            }
            var txEntry =
                <tr key={ i }>
                    <td>{ tx.id }</td>
                    <td>{ map[tx.type] }</td>
                    <td>
                        <Button className="me-2" id={ i } variant="primary btn-rounded" onClick={ (event) => { this.transactionSelected(tx) } }>
                            <span className="btn-icon-start text-primary">
                                <i className="fa fa-plus" />
                            </span>
                            Sign
                        </Button>
                    </td>
                    <td>
                        <Button className="me-2" id={ i } variant="danger btn-rounded" onClick={ (event) => { this.deleteTransaction(tx) } }>
                            <span className="btn-icon-start text-primary">
                                <i className="fa fa-minus" />
                            </span>
                            Delete
                        </Button>
                    </td>
                    <td>
                        { broadcastButton }
                    </td>
                </tr>

            transactionsTableEntries.push(txEntry);
            i++;
        });


        var transactionsComponent = <div className="row">
            <div className="col-xl-12 col-xxl-12">
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Stored transactions for select address: { this.state.multisigAddress }</h4>
                    </div>
                    <div className="card-body">
                        <Table responsive>
                            <thead>
                            <tr>
                                <th className="width80">
                                    <strong>Id</strong>
                                </th>
                                <th>
                                    <strong>Type</strong>
                                </th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                                { transactionsTableEntries }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>

        return (
            <Fragment>

                <div className="row">
                    <div className="col-xl-12 col-xxl-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Select multisig wallet to sign transactions for</h4>
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
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                { this.state.transactions.length !== 0 ? transactionsComponent : "" }

                { this.state.selectedTransactionComponent != null ? this.state.selectedTransactionComponent : "" }

                { this.state && this.state.showMessageModal ? <MessageModal ref={ this.modalRef } message={ this.state.message } /> : ''}

            </Fragment>
        );
    }

}