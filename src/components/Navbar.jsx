import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="global-navbar">
      <div className="navbar-brand">Biblioteca Digital</div>
      <div className="navbar-links">
        <NavLink 
          to="/autores" 
          className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Autores
        </NavLink>
        <NavLink 
          to="/libros" 
          className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Libros
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;