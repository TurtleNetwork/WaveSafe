import React, { useContext } from "react";

import {  Switch, Route } from "react-router-dom";

import "./index.css";
import "./step.css";

import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";

import Setting from "./layouts/Setting";
import { ThemeContext } from "../context/ThemeContext";
import CreateNewAddressWizard from "./createNewAddress/CreateNewAddressWizard";
import InitializeTransaction from "./initializeTransaction/InitializeTransaction";
import SignJsonTransaction from "./signJsonTransaction/SignJsonTransaction";
import AddAddress from "./storeMultisigAddress/AddAddress";
import SignStoredTransaction from "./signStoredTransactions/SignStoredTransaction";
import {Button, Modal} from "react-bootstrap";

class Disclaimer extends React.Component {

  constructor() {
    super();

    this.state = {
      showDisclaimer: true
    };
  }

  render() {
    return (<Modal className="fade bd-example-modal-lg" size="lg" show={ this.state.showDisclaimer }>
      <Modal.Header>
        <Modal.Title>Disclaimer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
        <p />
        THIS VERSION IS STILL IN BETA MODE. PLEASE ENSURE THAT YOU ARE ONLY TESTING
        WITH SMALLER AMOUNTS!
      </Modal.Body>
      <Modal.Footer>
        <Button
            variant="danger light"
            onClick={() => { this.setState({ showDisclaimer: false }); } }
        >
          Accept Terms
        </Button>
      </Modal.Footer>
    </Modal>)

  };

}

const Markup = (  ) => {
  const { menuToggle } = useContext(ThemeContext);
  const routes = [
    { url: "createAddress", component: CreateNewAddressWizard },
    { url: "addAddress", component: AddAddress },
    { url: "initTransaction", component: InitializeTransaction },
    { url: "signJsonTransaction", component: SignJsonTransaction },
    { url: "signStoredTransaction", component: SignStoredTransaction }
  ];
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];

  let pagePath = path.split("-").includes("page");

  return (
      <>
        <div
            id={`${!pagePath ? "main-wrapper" : ""}`}
            className={`${!pagePath ? "show" : "mh100vh"}  ${
                menuToggle ? "menu-toggle" : ""
            }`}
        >
          {!pagePath && <Nav />}

          <div className={`${!pagePath ? "content-body" : ""}`}>
            <div
                className={`${!pagePath ? "container-fluid" : ""}`}
                style={{ minHeight: window.screen.height - 60 }}
            >
              <Switch>
                {routes.map((data, i) => (
                    <Route
                        key={i}
                        exact
                        path={`/${data.url}`}
                        component={data.component}
                    />
                ))}
              </Switch>
            </div>
          </div>
          <Disclaimer />

          {!pagePath && <Footer />}
        </div>
        <Setting />
      </>
  );
};

export default Markup;
