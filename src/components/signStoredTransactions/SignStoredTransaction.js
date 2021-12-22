import React, { Fragment } from "react";

//import Type4TransactionRepresentation from "./Type4TransactionRepresentation";

import WavesDataProtocol from '../../dataProtocol/WavesDataProtocol';

import { Table } from "react-bootstrap";

export default class SignStoredTransaction extends React.Component {

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
            transactionComponent: null,
            multisigWallets: multisigWallets,
            multisigAddress: '',
            walletNames: walletNames,
            transactions: []
        };
    }

    transactionTypeSelected(event) {
        const type = event.target.value;

        if (type === '4') {
            //this.setState({ transactionComponent: <Type4TransactionRepresentation address={ this.state.multisigAddress }/> });
        }
    };

    async multisigWalletSelected(event) {
        const dataProtocol = new WavesDataProtocol();
        const address = event.target.value;
        this.setState({ multisigAddress: address });

        const transactions = await dataProtocol.getTransactionsForAddress(address);
        this.setState({ transactions: transactions });
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

                { this.state.transactionComponent != null ? this.state.transactionComponent : "" }

            </Fragment>
        );
    }

}