import React, { Fragment } from "react";

import Type4TransactionRepresentation from "./Type4TransactionRepresentation";

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import { Button, Table } from "react-bootstrap";

import config from '../../conf/config';

import MessageModal from '../modals/MessageModal';

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
            necessarySignaturesForAddress: 1000000
        };
    }

    transactionSelected(tx) {
        if (tx.type === 4) {
            this.setState({ selectedTransaction: tx });
        }
    };

    getSelectedTransactionComponent() {
        if (this.state.selectedTransaction && this.state.selectedTransaction.type === 4) {
            return <Type4TransactionRepresentation ref={ this.selectedTransactionComponentRef } tx={ this.state.selectedTransaction} />;
        }
    }

    async multisigWalletSelected(event) {
        const dataProtocol = new WavesDataProtocol();
        const address = event.target.value;
        const transactions = await dataProtocol.getTransactionsForAddress(address);
        const necessarySignaturesForAddressResponse = await fetch(config.node + '/addresses/data/' + address + '/necessarySignatures');
        const necessarySignaturesForAddressJSON = await necessarySignaturesForAddressResponse.json();
        const necessarySignaturesForAddress = necessarySignaturesForAddressJSON.value;

        this.setState({ multisigAddress: address, transactions: transactions, necessarySignaturesForAddress: necessarySignaturesForAddress });
    };

    // TODO: should be changed to real deletion of the entries once we understood how to do that with signer. :)
    async deleteTransactionEntry(id, senderPublicKey) {
        const transactionCountResponse = await fetch(config.node + '/addresses/data/' + this.state.multisigAddress + '/' + id + '_count');
        const transactionCountJSON = await transactionCountResponse.json();
        const transactionCount = transactionCountJSON.value;
        console.log(transactionCount);
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
        const signer = new Signer({ NODE_URL: config.node });
        const tx = {
            senderPublicKey: senderPublicKey,
            data: txData
        };

        signer.setProvider(new ProviderWeb(config.provider));

        await signer.data(tx).broadcast();
    }

    broadcast(tx) {
        const parent = this;
        var xhr = new XMLHttpRequest();

        xhr.open("POST", config.node + "/transactions/broadcast", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const message = 'Transaction sucessfully broadcasted!';

                parent.setState({ message: message, showMessageModal: true });
                if (parent.modalRef.current) {
                    parent.modalRef.current.activateModal(message);
                }
                parent.deleteTransactionEntry(tx.id, tx.senderPublicKey);
            } else if (xhr.readyState === 4 && xhr.status >= 400) {
                const message = JSON.parse(this.response).message;

                parent.setState({ message: message, showMessageModal: true });
                if (parent.modalRef.current) {
                    parent.modalRef.current.activateModal(message);
                }
            }
        };
        xhr.send(JSON.stringify(tx));
    }

    render() {
        const map = {
            '4': 'Transfer'
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
                                <i className="fa fa-minus" />
                            </span>
                            Sign
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

        const selectedTransactionComponent = this.getSelectedTransactionComponent();
        if (this.selectedTransactionComponentRef.current) {
            this.selectedTransactionComponentRef.current.setTx(this.state.selectedTransaction);
        }

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

                { this.state.selectedTransaction != null ? selectedTransactionComponent : "" }

                { this.state && this.state.showMessageModal ? <MessageModal ref={ this.modalRef } message={ this.state.message } /> : ''}

            </Fragment>
        );
    }

}