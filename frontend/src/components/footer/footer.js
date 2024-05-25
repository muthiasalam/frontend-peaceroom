import React from 'react';
import "./footer.css";
import footerimg from "../../assets/footer_siparua.png"

const footer = () => {
  return (
    <div className="footer">
      <div className="img_footer">
        <img src={footerimg} alt=""></img>
      </div>
      <div className="footer_component">
      <h2>PEACE ROOM A’KIO PEMKAB GOWA</h2>
        <p>
          Jl. Mesjid Raya No.30, Sungguminasa, Kec. Somba Opu, Kabupaten Gowa,
          Sulawesi Selatan 92111
        </p>
      </div>
    </div>
  )
}

export default footer