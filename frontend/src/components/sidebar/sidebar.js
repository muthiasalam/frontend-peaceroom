import React from "react";
import { DoorOpen, Calendar, ChevronsRight, ChevronsLeft, LogOut, TrendingUp } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import "./sidebar.css";
import logo from "../../assets/sidebar/logo.png";

const Navbar = ({ children, isSidebarOpen, setIsSidebarOpen }) => {
  const toggle = () => setIsSidebarOpen(!isSidebarOpen);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect ke halaman beranda setelah logout
  };

  const menuItem = [
    {
      path: "/peminjaman",
      name: "Peminjaman",
      icon: <Calendar className="icon" />,
    },
    {
      path: "/ruangan",
      name: "Ruangan",
      icon: <DoorOpen className="icon" />,
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <TrendingUp className="icon" />,
    }
  ];
  return (
    <div className="container">
      <div className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className={`top ${isSidebarOpen ? "top-visible" : ""}`}>
          <div className={`bars ${isSidebarOpen ? "bars-moved" : ""}`}>
            {isSidebarOpen ? (
              <ChevronsLeft onClick={toggle} className="icon chevron" />
            ) : (
              <ChevronsRight onClick={toggle} className="icon chevron" />
            )}
          </div>
        </div>
        <div className={`mid ${isSidebarOpen ? "mid-visible" : ""}`}>
          <img src={logo} className={`logo ${isSidebarOpen ? "logo-visible" : ""}`} />
          <div className={`text ${isSidebarOpen ? "text-visible" : ""}`}>A'kio Meeting Room</div>
        </div>
        <div className={`menus ${isSidebarOpen ? "menus-visible" : ""}`}>
          {menuItem.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className="link"
              activeClassName="active"
            >
              <div className="icon">{item.icon}</div>
              <div className={`link-text ${isSidebarOpen ? "link-text-visible" : ""}`}>
                {item.name}
              </div>
            </NavLink>
          ))}
        </div>
        <div className="bottom34">
          <button onClick={handleLogout} className={`signup-button ${isSidebarOpen ? "signup-button-visible" : ""}`}>
            <div className="signout-container">
              <span className="sidebar-bottom-span">Logout</span>
              <LogOut className="icon" />
            </div>
          </button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Navbar;
