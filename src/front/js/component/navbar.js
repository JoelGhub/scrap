import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Navbar.css"; // Import the CSS file

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="logo">SEO Einnova</span>
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/user" className="nav-link">
              Usuario
            </Link>
          </li>
          <li>
            <Link to="/test" className="nav-link">
              Download
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
