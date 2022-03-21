import React, { Fragment } from "react";

import Type3TransactionForm from "./Type3TransactionForm";
import Type4TransactionForm from "./Type4TransactionForm";
import Type5TransactionForm from "./Type5TransactionForm";
import Type6TransactionForm from "./Type6TransactionForm";
import Type8TransactionForm from "./Type8TransactionForm";
import Type9TransactionForm from "./Type9TransactionForm";
import Type11TransactionForm from "./Type11TransactionForm";
import Type13TransactionForm from "./Type13TransactionForm";
import Type14TransactionForm from "./Type14TransactionForm";
import Type15TransactionForm from "./Type15TransactionForm";
import Type16TransactionForm from "./Type16TransactionForm";

export default class InitializeTransaction extends React.Component {

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
            walletNames: walletNames
        };
    }

    transactionTypeSelected(event) {
        const type = event.target.value;

        if (type === '3') {
            this.setState({ transactionComponent: <Type3TransactionForm address={ this.state.multisigAddress }/> });
        } else if (type === '4') {
            this.setState({ transactionComponent: <Type4TransactionForm address={ this.state.multisigAddress }/> });
        } else if (type === '5') {
            this.setState({ transactionComponent: <Type5TransactionForm address={ this.state.multisigAddress }/> });
        } else if (type === '6') {
            this.setState({ transactionComponent: <Type6TransactionForm address={ this.state.multisigAddress }/> });
        } else if (type === '8') {
            this.setState({ transactionComponent: <Type8TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '9') {
            this.setState({ transactionComponent: <Type9TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '11') {
            this.setState({ transactionComponent: <Type11TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '13') {
            this.setState({ transactionComponent: <Type13TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '14') {
            this.setState({ transactionComponent: <Type14TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '15') {
            this.setState({ transactionComponent: <Type15TransactionForm address={ this.state.multisigAddress} />});
        } else if (type === '16') {
            this.setState({ transactionComponent: <Type16TransactionForm address={ this.state.multisigAddress} />});
        }
    };

    multisigWalletSelected(event) {
        this.setState({ multisigAddress: event.target.value });
    };

    render() {
        var multisigWalletOptions = [];

        this.state.multisigWallets.forEach(address => {
            var newMultisigOption = <option value={ address }>{ address } - { this.state.walletNames[address] }</option>

            multisigWalletOptions.push(newMultisigOption);
        });

        return (
            <Fragment>

                <div className="row">
                    <div className="col-xl-12 col-xxl-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Select transaction type</h4>
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
                                    <label className="text-label">Transaction type</label>
                                    <select
                                        defaultValue={"Transaction type"}
                                        className="form-control form-control-lg"
                                        onChange={ (event) => { this.transactionTypeSelected(event); } }
                                    >
                                        <option value="0">Choose a transaction type</option>
                                        <option value="3">Type 3 - Issue asset</option>
                                        <option value="4">Type 4 - Asset transfer</option>
                                        <option value="5">Type 5 - Reissue asset</option>
                                        <option value="6">Type 6 - Burn tokens</option>
                                        <option value="8">Type 8 - Lease</option>
                                        <option value="9">Type 9 - Cancel lease</option>
                                        <option value="11">Type 11 - Mass transfer</option>
                                        <option value="13">Type 13 - Set script</option>
                                        <option value="14">Type 14 - Sponsor asset</option>
                                        <option value="15">Type 15 - Set asset script</option>
                                        <option value="16">Type 16 - Invoke script</option>
                                    </select>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                { this.state.transactionComponent != null ? this.state.transactionComponent : "" }

            </Fragment>
        );
    }

}