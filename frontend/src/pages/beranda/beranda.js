import React from "react";
import Header from "../../components/header/header";
import Ruangan from "../../components/ruangan-user/ruangan-user";
import Home from "../../assets/home.png";
import Daftar from "../../components/DaftarJadwal/DaftarJadwal";
import Footer from "../../components/footer/footer";
import siparua from "../../assets/logo_siparua2.png";
import newsiparua from "../../assets/siparua-page.png";

import "./beranda.css";

export default function Beranda() {
  return (
    <>
      <Header />
      <div className="home-component">
        <div className="img-beranda">
          <div className="new-logo">
            <img className="logooo" src={siparua} alt=""></img>
            <img className="logo-teks" src={newsiparua} alt=""></img>
          </div>
          <div className="page-img">
            <img src={Home} alt=""></img>
          </div>
        </div>
      </div>
      <div className="title-menu">
        <h1>Ruangan</h1>
      </div>
      <Ruangan />
      <Daftar />
      <Footer />
    </>
  );
}