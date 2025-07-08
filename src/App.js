import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AutorMaterial from './components/AutorMaterial';
import LibroMaterial from './components/LibroMaterial';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/autores" element={<AutorMaterial />} />
            <Route path="/libros" element={<LibroMaterial />} />
            <Route path="*" element={<AutorMaterial />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;