import React, { useState } from "react";

const Dropdown = ({ id, status, handleStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    const handleOptionClick = (value) => {
      handleStatusChange(id, value); // Langsung mengirimkan value tanpa perlu melakukan perubahan
      setIsOpen(false);
    };
  
    return (
      <div className="dropdown">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          {status ? "true" : "false"}
        </button>
        {isOpen && (
          <ul className="dropdown-menu">
          <li className={`dropdown-menu-li ${status ? 'selected' : ''}`} onClick={() => handleOptionClick(true)}>
            <span>True</span> {status && <i className="fas fa-check"></i>}
          </li>
          <li className={`dropdown-menu-li ${!status ? 'selected' : ''}`} onClick={() => handleOptionClick(false)}>
            <span>False</span> {!status && <i className="fas fa-check"></i>}
          </li>
        </ul>
        
        
        
        
        )}
      </div>
    );
  };

  export default Dropdown;