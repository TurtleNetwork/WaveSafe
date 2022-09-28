import React, { Fragment } from "react";

import { Button, Modal, Row, Col, Card,  Tab, Nav } from 'react-bootstrap';

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../../conf/config';

import WavesDataProtocol from '../../../dataProtocol/WavesDataProtocol';

import MessageModal from '../../modals/MessageModal';

import BuyUSDN from './BuyUSDN';
import StakeNSBT from './StakeNSBT';
import BuyNSBT from './BuyNSBT';
import BuySURF from "./BuySURF";
import StakeSURF from "./StakeSURF";
import {ProviderKeeper} from "@waves/provider-keeper";

export default class USDN extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
        };
    }

    async signTransaction() {
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

        const signedTransaction = await signer.transfer(JSON.parse(this.state.jsonTransaction)).sign();
        // strange enough: seems like signer is changing data type to string for fee!
        signedTransaction.fee = parseInt(signedTransaction.fee);
        this.setState({ signedTransaction: signedTransaction, showSignedTransaction: true });
    };

    jsonTransactionChanged(event) {
        this.setState({ jsonTransaction: event.target.value });
    };

    closeModal() {
        this.setState({ showSignedTransaction: false });
    };

    async storeTransaction() {
        var error = false;

        try {
            const wavesDataProtocol = new WavesDataProtocol();
            const txData = wavesDataProtocol.serializeData(this.state.signedTransaction);
            const tx = {
                senderPublicKey: this.state.signedTransaction.senderPublicKey,
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
        return (
            <Fragment>
                <div className="row">
                    <div className="col-xl-12 col-xxl-12">
                        <Card>
                            <Card.Header>
                                <Card.Title>Neutrino USDN</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Tab.Container defaultActiveKey="buy_usdn">
                                        <Col sm={4}>
                                            <Nav as="ul" className="flex-column nav-pills mb-3">
                                                <Nav.Item as="li" key="buy_usdn">
                                                    <Nav.Link eventKey="buy_usdn">
                                                        Buy USDN
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                            <Nav as="ul" className="flex-column nav-pills mb-3">
                                                <Nav.Item as="li" key="buy_nsbt">
                                                    <Nav.Link eventKey="buy_nsbt">
                                                        Buy NSBT
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                            <Nav as="ul" className="flex-column nav-pills mb-3">
                                                <Nav.Item as="li" key="buy_surf">
                                                    <Nav.Link eventKey="buy_surf">
                                                        Buy SURF
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                            <Nav as="ul" className="flex-column nav-pills mb-3">
                                                <Nav.Item as="li" key="stake_nsbt">
                                                    <Nav.Link eventKey="stake_nsbt">
                                                        Stake NSBT
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                            <Nav as="ul" className="flex-column nav-pills mb-3">
                                                <Nav.Item as="li" key="stake_surf">
                                                    <Nav.Link eventKey="stake_surf">
                                                        Stake SURF
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                        </Col>
                                        <Col sm={8}>
                                            <Tab.Content className="ms-2">
                                                <Tab.Pane eventKey="buy_usdn" key="buy_usdn">
                                                    <BuyUSDN />
                                                </Tab.Pane>
                                            </Tab.Content>{" "}
                                            <Tab.Content className="ms-2">
                                                <Tab.Pane eventKey="buy_nsbt" key="buy_nsbt">
                                                    <p>
                                                        <BuyNSBT />
                                                    </p>
                                                </Tab.Pane>
                                            </Tab.Content>{" "}
                                            <Tab.Content className="ms-2">
                                                <Tab.Pane eventKey="buy_surf" key="buy_surf">
                                                    <p>
                                                        <BuySURF />
                                                    </p>
                                                </Tab.Pane>
                                            </Tab.Content>{" "}
                                            <Tab.Content className="ms-2">
                                                <Tab.Pane eventKey="stake_nsbt" key="stake_nsbt">
                                                    <p>
                                                        <StakeNSBT />
                                                    </p>
                                                </Tab.Pane>
                                            </Tab.Content>{" "}
                                            <Tab.Content className="ms-2">
                                                <Tab.Pane eventKey="stake_surf" key="stake_surf">
                                                    <p>
                                                        <StakeSURF />
                                                    </p>
                                                </Tab.Pane>
                                            </Tab.Content>{" "}
                                        </Col>
                                    </Tab.Container>
                                </Row>
                            </Card.Body>
                        </Card>
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

            </Fragment>
        );
    }

}