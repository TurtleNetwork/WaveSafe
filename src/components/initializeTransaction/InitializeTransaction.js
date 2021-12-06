import React, { Fragment } from "react";

import Type4TransactionForm from "./Type4TransactionForm";

export default class InitializeTransaction extends React.Component {

    constructor(props) {
        super(props);
        var multisigWallets = JSON.parse(localStorage.getItem('multisigWallets'));

        if (!multisigWallets) {
            multisigWallets = [];
        }

        this.state = {
            transactionComponent: null,
            multisigWallets: multisigWallets,
            multisigAddress: ''
        };
    }

    transactionTypeSelected(event) {
        const type = event.target.value;

        if (type === '4') {
            this.setState({ transactionComponent: <Type4TransactionForm address={ this.state.multisigAddress }/> });
        }
    };

    multisigWalletSelected(event) {
        this.setState({ multisigAddress: event.target.value });
    };

    render() {
        var multisigWalletOptions = [];

        this.state.multisigWallets.forEach(address => {
            var newMultisigOption = <option value={ address }>{ address }</option>

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
                                        <option value="4">Type 4 - Asset transfer</option>
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