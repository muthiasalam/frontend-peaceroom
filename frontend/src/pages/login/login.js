import React from "react";
import background from "../../assets/login/backgrpund.jpg";
import logo from "../../assets/login/logo.png";
import { LoginForm } from "../../components/login/login-form/login-form";
import "./login.css"; 

export const Login = () => {
  return (
    <div className="login-container">

<div className="background-layer">
  <img className="background-image" src={background} alt="background" />
  <div className="overlay"></div>
</div>

     
      <div className="overlay-layer">
        <div className="overlay-layer-a">
        <img className="login-logo" src={logo} alt="logo" />
        </div>

        <div className="overlay-layer-b">
          <div className="login-form">
            <div className="form-title">Login</div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};
