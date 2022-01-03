import React from 'react';

import { Button, Modal } from "react-bootstrap";

export default class MessageModel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            message: props.message,
            showMe: true
        }
    }

    activateModal(message) {
        this.setState({ message: message, showMe: true });
    }

    closeModal() {
        this.setState({ message: '', showMe: false });
    }

    render() {
        return (
            <Modal className="fade bd-example-modal-lg" size="lg" show={ this.state.showMe }>
                <Modal.Header>
                    <Modal.Title>Message</Modal.Title>
                    <Button
                        variant=""
                        className="btn-close"
                        onClick={() => this.closeModal()}
                    >
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <pre>{ this.state.message }</pre>
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
        );
    }

}