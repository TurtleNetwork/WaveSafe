import React from 'react';

import { Button, Modal } from "react-bootstrap";

export default class CreatePaymentModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            assets: props.assets,
            showMe: true,
            asset: null,
            amount: ''
        }

        this.setParentState = props.setParentState;
        this.parentState = props.parentState;
    }

    activateModal(assets) {
        this.setState({ assets: assets, showMe: true });
    };

    closeModal() {
        this.setState({ assets: [], asset: '', amount: -1, showMe: false });
    };

    assetSelected(event) {
        this.setState({ asset: event.target.value });
    };

    amountChanged(event) {
        const decimals = this.getDecimals(this.state.asset);

        this.setState({ amount: parseFloat(event.target.value) * Math.pow(10, decimals) });
    };

    getDecimals(assetId) {
        var decimals = 0;

        if (!assetId) {
            decimals = 8;
        } else {
            this.state.assets.forEach(asset => {
                if (asset.assetId === assetId) {
                    decimals = asset.issueTransaction.decimals;
                }
            });
        }

        return decimals;
    };

    addPayment() {
        var payments = this.parentState.payments;

        payments.push({ assetId: this.state.asset, amount: this.state.amount });
        this.setParentState({ payments: payments });
        this.closeModal();
    };

    render() {
        var assetOptions = [];

        this.state.assets.forEach(asset => {
            var assetOption = <option value={ asset.assetId }>{ asset.issueTransaction.name } - { asset.assetId }</option>;

            assetOptions.push(assetOption);
        });

        return (
            <Modal className="fade bd-example-modal-lg" size="lg" show={ this.state.showMe }>
                <Modal.Header>
                    <Modal.Title>Add payment</Modal.Title>
                    <Button
                        variant=""
                        className="btn-close"
                        onClick={() => this.closeModal()}
                    >
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        id="step-form-horizontal"
                        className="step-form-horizontal"
                    >
                        <br />
                        <label className="text-label">Fee asset</label>
                        <select
                            defaultValue={"Select an asset as fee"}
                            className="form-control form-control-lg"
                            onChange={ (event) => { this.assetSelected(event); } }
                        >
                            <option value="null">Waves</option>
                            { assetOptions }
                        </select>
                        <br />
                        <label className="text-label">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            className="form-control"
                            onChange={ (event) => { this.amountChanged(event); } }
                            readonly={ this.state.asset && this.state.asset.length !== 0 }
                        />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary light"
                        onClick={() => this.addPayment() }>
                        Add payment
                    </Button>
                     <Button
                        variant="danger light"
                        onClick={() => this.closeModal() }>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

}