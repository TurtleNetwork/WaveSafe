import React from "react";

import { Button, Row, Col, Card, Table } from "react-bootstrap";

import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';

import config from '../../conf/config';

export default class ContractDeploymentStep extends React.Component {

   constructor(props, context) {
      super(props, context);

      this.parentState = props.state;
       console.log(this.parentState);
   }

   createContract() {
      const names = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eigth' ];
      var contract = '{-# STDLIB_VERSION 5 #-}\n' +
          '{-# CONTENT_TYPE DAPP #-}\n' +
          '{-# SCRIPT_TYPE ACCOUNT #-}\n' +
          '\n' +
          '@Verifier(tx)\n' +
          'func verify() = {\n' +
          '<publicKeyPart>\n' +
          '<signaturePart>\n' +
          '<check>\n' +
          '\n' +
          '\tmatch (tx) {\n' +
          '\t\tcase t: DataTransaction => signaturesCount >= 1\n' +
          '\t\tcase _ => signaturesCount >= ' + this.parentState.minSignatures + '\n' +
          '\t}\n' +
          '}';
      var publicKeyPart = '';
      var signaturePart = '';
      var checkPart = '\tlet signaturesCount = ';

      for (var i = 0; i < this.parentState.addresses.length; i++) {
         const publicKey = this.parentState.addresses[i].publicKey;
         var check = names[i] + 'UserSigned + ';
         var part = '\tlet ' + names[i] + 'User = base58\'' + publicKey + '\'\n';

         publicKeyPart += part;
         checkPart += check;
      }
      checkPart = checkPart.substring(0, checkPart.length - 3);

      for (i = 0; i < this.parentState.addresses.length; i++) {
         var sigVerifyParts = '';
         for (var j = 0; j < this.parentState.addresses.length; j++) {
            var sigVerifyPart = 'sigVerify(tx.bodyBytes, tx.proofs[' + j + '], ' + names[i] + 'User) || ';
            sigVerifyParts += sigVerifyPart;
         }
         sigVerifyParts = sigVerifyParts.substring(0, sigVerifyParts.length - 4);
         var userPart = '\tlet ' + names[i] + 'UserSigned = if(' + sigVerifyParts + ') then 1 else 0\n';

         signaturePart += userPart
      }
      contract = contract.replace('<signaturePart>', signaturePart);
      contract = contract.replace('<publicKeyPart>', publicKeyPart);
      contract = contract.replace('<check>', checkPart);

      return contract;
   }

   async deployContract(compiledContract) {
       const signer = new Signer({ NODE_URL: config.node });
       const data = { script: compiledContract};

       signer.setProvider(new ProviderWeb(config.provider));
       const setScriptTx = await signer.setScript(data).broadcast();
       const txData = [{ key: 'publicKey', type: 'string', value: setScriptTx.senderPublicKey }];
       const tx = {
           senderPublicKey: setScriptTx.senderPublicKey,
           data: txData,
           fee: 500000
       };
       await signer.data(tx).broadcast();
   }

   compileContract(contract, callback) {
      var xhr = new XMLHttpRequest();

      xhr.open("POST", config.node + "/utils/script/compileCode", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");

      xhr.onreadystatechange = function() {
         if(xhr.readyState === 4 && xhr.status === 200) {
            const scriptObject = JSON.parse(this.response);
            const compiledScript = scriptObject.script;

            callback(compiledScript);
         }
      };
      xhr.send(contract);
   }

   confirmAndDeployContract() {
      const contract = this.createContract();

      this.compileContract(contract, (compiledContract) => {
          this.deployContract(compiledContract);
      });
   }

   render() {
      const addresses = this.parentState.addresses;
      var addressEntries = [];

      var i = 0;
      addresses.forEach((address) => {
         var addressEntry =
             <tr key={ i }>
                <td>{ localStorage.getItem(address.address) }</td>
                <td>{ address.address }</td>
                <td>{ address.publicKey }</td>
             </tr>

         addressEntries.push(addressEntry);
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
             <h3>Please confirm:</h3>
             The new multisig address will need at least <strong>{ this.parentState.minSignatures }</strong> signatures from the following addresses:

             { table }

             <div className="row">
                <div className="col-lg-3 mb-2">
                   <div className="form-group mb-3">
                      <Button className="me-2" variant="secondary" onClick={ () => { this.confirmAndDeployContract(); }}>
                         Confirm and deploy contract
                      </Button>
                   </div>
                </div>
             </div>

          </section>

      );

   }
};

