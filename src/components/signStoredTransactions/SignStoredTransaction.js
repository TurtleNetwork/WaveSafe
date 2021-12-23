import React, { Fragment } from "react";

import Type4TransactionRepresentation from "./Type4TransactionRepresentation";

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import { Button, Table } from "react-bootstrap";

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

        this.state = {
            multisigWallets: multisigWallets,
            multisigAddress: '',
            walletNames: walletNames,
            transactions: [],
            selectedTransaction: null
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
        this.setState({ multisigAddress: address, transactions: transactions });
    };

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

            </Fragment>
        );
    }

}