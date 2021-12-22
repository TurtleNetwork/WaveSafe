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

const Markup = () => {
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
        {!pagePath && <Footer />}
      </div>
      <Setting />
    </>
  );
};

export default Markup;
