import React, { Fragment, useContext, useState } from "react";
/// React router dom
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

import wavesafe_trans from '../../../images/wavesafe_trans.png'; // with import


const NavHader = () => {
  const [toggle, setToggle] = useState(false);
  const { navigationHader, openMenuToggle, background } = useContext(
    ThemeContext
  );

  return (
    <div className="nav-header">
      <Link to="/" className="brand-logo">
        {background.value === "dark" || navigationHader !== "color_1" ? (
          <Fragment>
                <img src={wavesafe_trans} alt="wavesafe logo" width="60px" />
              { !toggle ? <h1>WaveSafe</h1> : "" }
          </Fragment>
        ) : (
          <Fragment>
              <img src={wavesafe_trans} alt="wavesafe logo" width="60px" />
              { !toggle ? <h1>WaveSafe</h1> : "" }
          </Fragment>
        )}
      </Link>

      <div
        className="nav-control"
        onClick={() => {
          setToggle(!toggle);
          openMenuToggle();
        }}
      >
        <div className={`hamburger ${toggle ? "is-active" : ""}`}>
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;
