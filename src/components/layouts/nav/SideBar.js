/// Menu
import Metismenu from "metismenujs";
import React, { Component, useContext, useEffect } from "react";
/// Scroll
import PerfectScrollbar from "react-perfect-scrollbar";
/// Link
import { Link } from "react-router-dom";
import useScrollPosition from "use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";

class MM extends Component {
  componentDidMount() {
    this.$el = this.el;
    this.mm = new Metismenu(this.$el);
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <div className="mm-wrapper">
        <ul className="metismenu" ref={(el) => (this.el = el)}>
          {this.props.children}
        </ul>
      </div>
    );
  }
}

const SideBar = () => {
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
  } = useContext(ThemeContext);
  useEffect(() => {
    var btn = document.querySelector(".nav-control");
    var aaa = document.querySelector("#main-wrapper");
    function toggleFunc() {
      return aaa.classList.toggle("menu-toggle");
    }
    btn.addEventListener("click", toggleFunc);
	
	//sidebar icon Heart blast

  }, []);
  let scrollPosition = useScrollPosition();
  return (
    <div
      className={`dlabnav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? scrollPosition > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <PerfectScrollbar className="dlabnav-scroll">
        <MM className="metismenu" id="menu">
          <li>
            <Link className="ai-icon" to="/createAddress" >
              <i className="flaticon-084-share"></i>
              <span className="nav-text">Create multisig address</span>
            </Link>
          </li>
          <li>
            <Link className="ai-icon" to="/addAddress" >
              <i className="flaticon-066-plus"></i>
              <span className="nav-text">Add multisig address</span>
            </Link>
          </li>
          <li>
            <Link className="has-arrow ai-icon" to="#">
              <i className="flaticon-008-check"></i>
              <span className="nav-text forms">Transactions</span>
            </Link>
            <ul >
              <li>
                <Link to="/initTransaction">
                  Initialize transaction
                </Link>
              </li>
              <li>
                <Link to="/signJsonTransaction">
                  Sign JSON transaction
                </Link>
              </li>
            </ul>
          </li>

        </MM>
      </PerfectScrollbar>
    </div>
  );
};

export default SideBar;

