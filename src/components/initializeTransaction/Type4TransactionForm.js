import React from 'react';

import { Button, Modal } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

export default class Type4TransactionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            multisigAddress: props.address,
            recipient: '',
            amount: 0,
            assets: [],
            sponsoredAssets: [],
            waves: 0,
            assetToSend: '',
            feeAsset: '',
            fee: 100000,
            showSignedTransaction: false,
            signedTransaction: ''
        };

        this.getAssets();
    };

    async getAssets() {
        const wavesBalanceResponse = await fetch('https://nodes-testnet.wavesnodes.com/addresses/balance/' + this.state.multisigAddress);
        const wavesBalance = await wavesBalanceResponse.json();
        const waves = wavesBalance.balance;
        const assetsResponse = await fetch('https://nodes-testnet.wavesnodes.com/assets/balance/' + this.state.multisigAddress);
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

    recipientChanged(event) {
        this.setState({ recipient: event.target.value });
    };

    amountChanged(event) {
        const amount = parseFloat(event.target.value);
        const decimals = this.getAssetDecimals(this.state.assetToSend);

        this.setState({ amount: amount * Math.pow(10, decimals) });
    };

    assetSelected(event) {
        this.setState({ assetToSend: event.target.value });
    };

    feeAssetSelected(event) {
        var feeAsset = event.target.value;

        if (feeAsset === 'null') {
            feeAsset = null;
        }

        this.setState({ feeAsset: feeAsset });
    };

    feeChanged(event) {
        const fee = parseFloat(event.target.value);
        const decimals = this.getAssetDecimals(this.state.feeAsset);

        this.setState({ fee: fee * Math.pow(10, decimals) });
    };

    async signTransaction() {
        const signer = new Signer({ NODE_URL: 'https://nodes-testnet.wavesnodes.com' });
        var transfer = { amount: parseInt(this.state.amount), recipient: this.state.recipient, fee: 1000000 };

        signer.setProvider(new ProviderWeb('https://testnet.waves.exchange/signer/'));

        if (this.state.feeAsset !== '') {
            transfer.feeAssetId = this.state.feeAsset;
            transfer.fee = parseInt(this.state.fee);
        }
        if (this.state.assetToSend !== '') {
            transfer.assetId = this.state.assetToSend;
        }

        const signedTransfer = await signer.transfer(transfer).sign();
        // strange enough: seems like signer is changing data type to string for fee!
        signedTransfer.fee = parseInt(this.state.fee);
        this.setState({ signedTransaction: signedTransfer, showSignedTransaction: true });
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    render() {
        var assets = [];
        var sponsoredAssets = [];

        this.state.assets.forEach(asset => {
            var assetOption = <option value={ asset.assetId }>{ asset.issueTransaction.name } - { asset.assetId }</option>

            assets.push(assetOption);
        });
        this.state.sponsoredAssets.forEach(asset => {
            var assetOption = <option value={ asset.assetId }>{ asset.issueTransaction.name } - { asset.assetId }</option>

            sponsoredAssets.push(assetOption);
        });

        return (
            <div className="row">
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Initialize a new transaction</h4>
                        </div>
                        <div className="card-body">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                id="step-form-horizontal"
                                className="step-form-horizontal"
                            >
                                <label className="text-label">Recipient</label>
                                <input
                                    type="text"
                                    name="recipient"
                                    className="form-control"
                                    onChange={ (event) => { this.recipientChanged(event); } }
                                    required
                                />
                                <br />
                                <label className="text-label">Asset</label>
                                <select
                                    defaultValue={"Select an asset"}
                                    className="form-control form-control-lg"
                                    onChange={ (event) => { this.assetSelected(event); } }
                                >
                                    <option value="null">Waves</option>
                                    { assets }
                                </select>
                                <br />
                                <label className="text-label">Amount</label>
                                <input
                                    type="text"
                                    name="amount"
                                    className="form-control"
                                    onChange={ (event) => { this.amountChanged(event); } }
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
                                <label className="text-label">Fee</label>
                                <input
                                    type="text"
                                    name="fee"
                                    className="form-control"
                                    onChange={ (event) => { this.feeChanged(event); } }
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
                        <Modal.Title>Modal title</Modal.Title>
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
                            variant="danger light"
                            onClick={() => this.closeModal() }
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

            </div>
        );
    };

}