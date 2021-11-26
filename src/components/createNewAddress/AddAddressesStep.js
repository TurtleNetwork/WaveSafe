import React from "react";

import { Button, Row, Col, Card, Table } from "react-bootstrap";

import Select from "react-select";


export default class AddAddressesStep extends React.Component {

   constructor(props, context) {
      super(props, context);

      this.state = {
         parentState: props.state,
         addresses: props.state.addresses,
         newPublicKey: '',
         newAddress: ''
      };
      this.setParentState = props.setState;
   }

   async publicKeyChange(event) {
      const publicKey = event.target.value;
      const publicKeyResponse = await fetch('https://nodes-testnet.wavesnodes.com/addresses/publicKey/' + publicKey);
      const publicKeyResponseJSON = await publicKeyResponse.json();

      if (publicKeyResponseJSON.error) {
         console.log('wrong public key provided!');
      } else {
         this.setState({ newPublicKey: publicKey, newAddress: publicKeyResponseJSON.address });
      }
   }

   storeAddress() {
      var currentAddresses = this.state.addresses;
      currentAddresses.push({ address: this.state.newAddress, publicKey: this.state.newPublicKey });
      this.setState({ addresses: currentAddresses });
      this.setParentState({ addresses: currentAddresses });
   }

   nameChanged(event) {
      const name = event.target.value;

      localStorage.setItem(this.state.newAddress, name);
   }

   removeAddress(event) {
      const i = event.target.id;
      var currentAddresses = this.state.addresses;

      currentAddresses.splice(i, 1);

      this.setState({ addresses: currentAddresses });
      this.setParentState({ addresses: currentAddresses });
   }

   setSelectedOption(event) {
      const minSignatures = event.value;

      this.setParentState({ minSignatures: minSignatures });
   }

   render() {
      const addresses = this.state.addresses;
      var addressEntries = [];
      var options = [];

      var i = 0;
      addresses.forEach((address) => {
         var addressEntry =
             <tr key={ i }>
                <td>{ localStorage.getItem(address.address) }</td>
                <td>{ address.address }</td>
                <td>{ address.publicKey }</td>
                <td>
                   <Button className="me-2" id={ i } variant="danger btn-rounded" onClick={ (event) => { this.removeAddress(event) } }>
                     <span className="btn-icon-start text-primary">
                        <i className="fa fa-minus" />
                     </span>
                     Remove
                  </Button>
                </td>
             </tr>

         addressEntries.push(addressEntry);
         if (i < 8) {
            options.push({ value: (i + 1), label: (i + 1) });
         }
         i++;
      });
      var table =
          <Row>
             <Col lg={12}>
                <Card>
                   <Card.Header>
                      <Card.Title>Registered addresses</Card.Title>
                   </Card.Header>
                   <Card.Body>
                      <Table responsive>
                         <thead>
                         <tr>
                            <th className="width80">
                               <strong>Name</strong>
                            </th>
                            <th>
                               <strong>Address</strong>
                            </th>
                            <th>
                               <strong>Public key</strong>
                            </th>
                            <th>
                               <strong></strong>
                            </th>
                         </tr>
                         </thead>
                         <tbody>
                           { addressEntries }
                         </tbody>
                      </Table>
                   </Card.Body>
                </Card>
             </Col>
          </Row>

       return (
          <section>
             Now we need to add public keys of addresses that will later on be able to create signatures necessary for transactions of the newly created multisig address.

             { table }

             <div className="row">
                <div className="col-lg-4 mb-2">
                   <div className="form-group mb-3">
                      <label className="text-label">Public key of new signing address</label>
                      <input
                          type="text"
                          name="publicKey"
                          className="form-control"
                          placeholder=""
                          onChange={ (event) => { this.publicKeyChange(event); } }
                          required
                      />
                   </div>
                </div>
                <div className="col-lg-4 mb-2">
                   <div className="form-group mb-3">
                      <label className="text-label">New signing address</label>
                      <input
                          type="text"
                          name="newAddress"
                          className="form-control"
                          placeholder={ this.state.newAddress }
                          readOnly="true"
                          required
                      />
                   </div>
                </div>
                <div className="col-lg-4 mb-2">
                   <div className="form-group mb-3">
                      <label className="text-label">Name</label>
                      <input
                          type="text"
                          name="name"
                          className="form-control"
                          onChange={ (event) => { this.nameChanged(event); } }
                          required
                      />
                   </div>
                </div>
             </div>
             <div className="row">
                <div className="col-lg-2 mb-2">
                   <div className="form-group mb-3">
                      <Button className="me-2" variant="secondary" onClick={ () => { this.storeAddress(); }}>
                         Store address
                      </Button>
                   </div>
                </div>
                <div className="col-lg-4 mb-2 text-end">
                   There will be
                </div>
                <div className="col-lg-2 mb-2">
                   <div>
                      <Select
                          onChange={(event) => { this.setSelectedOption(event); } }
                          options={ options }
                          style={{
                          lineHeight: "40px",
                          color: "#7e7e7e",
                           paddingLeft: " 15px",
                         }}
                      />
                   </div>
                </div>
                <div className="col-lg-4 mb-2">
                   out of { this.state.addresses.length } signatures necessary in order to sign a transacion.
                </div>
             </div>

          </section>
      );

   }
};
