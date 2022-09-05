import React from "react";


export default class Header extends React.Component {

  render() {
    var path = window.location.pathname.split("/");
    var name = path[path.length - 1];

    var finalName = '';

    if (name === 'createAddress') {
      finalName = 'Create multisig address';
    } else if (name === 'initTransaction') {
      finalName = 'Initialize transaction';
    } else if (name === 'signJsonTransaction') {
      finalName = 'Sign a transaction in JSON';
    } else if (name === 'addAddress') {
      finalName = 'Add a new multisig address';
    } else if (name === 'signStoredTransaction') {
      finalName = 'Sign stored transaction';
    } else if (name === 'usdn') {
      finalName = 'USDN Transactions';
    }

    return (
        <div className="header">
          <div className="header-content">
            <nav className="navbar navbar-expand">
              <div className="collapse navbar-collapse justify-content-between">
                <div className="header-left">
                  <div
                      className="dashboard_bar"
                      style={{ textTransform: "capitalize" }}
                  >
                    { finalName }
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
    );

  }

}
