import React, { Fragment } from "react";
import Multistep from "react-multistep";

import AddressAuthenticationStep from "./AddressAuthenticationStep";
import AddAddressesStep from "./AddAddressesStep";
import ContractDeploymentStep from "./ContractDeploymentStep";

export default class Wizard extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      addresses: [],
      minSignatures: 0
    }
  }

  render() {
    const steps = [
      { name: "Authenticate address", component: <AddressAuthenticationStep setState={ (state) => { this.setState(state); } }  /> },
      { name: "Add signing addresses", component: <AddAddressesStep setState={ (state) => { this.setState(state); } } state={ this.state } /> },
      { name: "Approve", component: <ContractDeploymentStep state={ this.state } /> }
    ];
    const prevStyle = {
      background: "#F7FAFC",
      borderWidth: "0px",
      color: "#333333",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 18px",
      border: "1px solid #EEEEEE",
      marginRight: "1rem",
    };
    const nextStyle = {
      background: "#5bcfc5",
      borderWidth: "0px",
      color: "#fff",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "600",
      padding: "12px 18px",
    };
    return (
        <Fragment>

          <div className="row">
            <div className="col-xl-12 col-xxl-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Creation of a new multisig address</h4>
                </div>
                <div className="card-body">
                  <form
                      onSubmit={(e) => e.preventDefault()}
                      id="step-form-horizontal"
                      className="step-form-horizontal"
                  >
                    <Multistep
                        showNavigation={true}
                        steps={steps}
                        prevStyle={prevStyle}
                        nextStyle={nextStyle}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
    );
  }
};

