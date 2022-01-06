import React from "react";

import { Button } from "react-bootstrap";

import MessageModal from '../modals/MessageModal';

export default class AddAddress extends React.Component {

   constructor(props, context) {
      super(props, context);

      this.state = {
         newAddress: '',
         name: '',
         message: '',
         showMessageModal: false
      };
      this.modalRef = React.createRef()
   }

   storeAddress() {
      var currentAddresses;

      if (!localStorage.getItem('multisigWallets')) {
         currentAddresses = [];
      } else {
         currentAddresses = JSON.parse(localStorage.getItem('multisigWallets'));
      }
      currentAddresses.push(this.state.newAddress);
      localStorage.setItem('multisigWallets', JSON.stringify(currentAddresses));
      localStorage.setItem(this.state.newAddress, this.state.name);
      this.setState({ message: 'Address successfully stored locally!', showMessageModal: true });
      if (this.modalRef.current) {
         this.modalRef.current.activateModal(this.state.message);
      }
   }

   nameChanged(event) {
      const name = event.target.value;

      this.setState({ name: name });
   }

   addressAdded(event) {
      const address = event.target.value;

      this.setState({ newAddress: address });
   }

   render() {
       return (
           <div className="col-xl-12 col-xxl-12">
              <div className="card">
                 <div className="card-header">
                    <h4 className="card-title">Add a new multisig address to your wallet</h4>
                 </div>
                 <div className="card-body">
                    <section>
                       Provide the address you want to add to your wallet.
                       <p />
                       <div className="row">
                          <div className="col-lg-6 mb-2">
                             <div className="form-group mb-3">
                                <label className="text-label">Multisig address to add</label>
                                <input
                                   type="text"
                                   name="newAddress"
                                   className="form-control"
                                   onChange={ (event) => { this.addressAdded(event); } }
                                   required
                                />
                             </div>
                         </div>
                         <div className="col-lg-6 mb-2">
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
                         <div className="row">
                            <div className="col-lg-4 mb-2">
                               <div className="form-group mb-3">
                                  <Button className="me-2" variant="secondary" onClick={ () => { this.storeAddress(); }}>
                                     Store address
                                  </Button>
                               </div>
                            </div>
                         </div>
                     </div>
                   </section>
                 </div>
            </div>

            { this.state && this.state.showMessageModal ? <MessageModal ref={ this.modalRef } message={ this.state.message } /> : ''}

           </div>
      );

   }
};
