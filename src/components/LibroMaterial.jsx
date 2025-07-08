import React, { useState, useEffect } from 'react';
import '../css/LibroMaterial.css';

const LibroMaterial = () => {
    const [libros, setLibros] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [fechaPublicacion, setFechaPublicacion] = useState('');
    const [autorLibro, setAutorLibro] = useState('');
    const [libroID, setLibroID] = useState('');
    const [libroConsultado, setLibroConsultado] = useState(null);
    const [activeTab, setActiveTab] = useState('listar');
    const [errors, setErrors] = useState({
        titulo: '',
        fechaPublicacion: '',
        autorLibro: '',
        libroID: ''
    });

    useEffect(() => {
        if (activeTab === 'listar') {
            obtenerLibros();
        }
    }, [activeTab]);

    const obtenerLibros = async () => {
        try {
            const response = await fetch("https://localhost:32783/api/LibroMaterial");
            const data = await response.json();
            setLibros(data);
        } catch (error) {
            console.error("Error al obtener libros:", error);
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            titulo: '',
            fechaPublicacion: '',
            autorLibro: '',
            libroID: ''
        };

        if (!titulo.trim()) {
            newErrors.titulo = 'El título es requerido';
            valid = false;
        }

        if (!fechaPublicacion) {
            newErrors.fechaPublicacion = 'La fecha de publicación es requerida';
            valid = false;
        } else if (new Date(fechaPublicacion) > new Date()) {
            newErrors.fechaPublicacion = 'La fecha no puede ser futura';
            valid = false;
        }

        if (!autorLibro.trim()) {
            newErrors.autorLibro = 'El ID del autor es requerido';
            valid = false;
        } else if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(autorLibro)) {
            newErrors.autorLibro = 'Ingrese un UUID válido';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const validateConsultForm = () => {
        let valid = true;
        const newErrors = {
            ...errors,
            libroID: ''
        };

        if (!libroID.trim()) {
            newErrors.libroID = 'El ID del libro es requerido';
            valid = false;
        } 
        setErrors(newErrors);
        return valid;
    };

    const crearLibro = async () => {
        if (!validateForm()) return;

        try {
            const nuevoLibro = {
                titulo,
                fechaPublicacion: new Date(fechaPublicacion).toISOString(),
                autorLibro
            };

            const response = await fetch("https://localhost:32783/api/LibroMaterial", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoLibro)
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Error en la creación:", error);
                alert(`Error al crear el libro: ${error}`);
                return;
            }

            setTitulo('');
            setFechaPublicacion('');
            setAutorLibro('');
            setErrors({
                titulo: '',
                fechaPublicacion: '',
                autorLibro: '',
                libroID: ''
            });
            alert("Libro creado exitosamente!");
            setActiveTab('listar');
        } catch (error) {
            console.error("Error en la creación:", error);
            alert("Ocurrió un error al crear el libro");
        }
    };

  const consultarLibroPorID = async () => {
    if (!validateConsultForm()) return;

    try {
        console.log(`Consultando libro con ID: ${libroID}`); // Log para depuración
        
        const response = await fetch(`https://localhost:32783/api/LibroMaterial/${libroID}`);
        
        console.log('Respuesta del servidor:', response); // Log para depuración
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data); // Log para depuración
        
        setLibroConsultado(data);
    } catch (error) {
        console.error("Error detallado al consultar libro:", error);
        alert(`Error al consultar el libro: ${error.message}`);
        setLibroConsultado(null);
    }
};

    const renderTabContent = () => {
        switch (activeTab) {
            case 'listar':
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Lista de Libros</h2>
                        <div className="books-grid">
                            {libros.map((libro, index) => (
                                <div key={index} className="book-card">
                                    <h3>{libro.titulo}</h3>
                                    <p><strong>Publicación:</strong> {new Date(libro.fechaPublicacion).toLocaleDateString()}</p>
                                    <p><strong>Autor ID:</strong> {libro.autorLibro}</p>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => {
                                            setLibroID(libro.libroMaterialId);
                                            setActiveTab('consultar');
                                        }}
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'crear':
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Crear Nuevo Libro</h2>
                        <div className="form-container">
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    placeholder="Título del libro"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    className={errors.titulo ? 'input-error' : ''}
                                />
                                {errors.titulo && <span className="error-message">{errors.titulo}</span>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de Publicación *</label>
                                <input
                                    type="date"
                                    value={fechaPublicacion}
                                    onChange={(e) => setFechaPublicacion(e.target.value)}
                                    className={errors.fechaPublicacion ? 'input-error' : ''}
                                />
                                {errors.fechaPublicacion && <span className="error-message">{errors.fechaPublicacion}</span>}
                            </div>
                            <div className="form-group">
                                <label>UUID del Autor *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
                                    value={autorLibro}
                                    onChange={(e) => setAutorLibro(e.target.value)}
                                    className={errors.autorLibro ? 'input-error' : ''}
                                />
                                {errors.autorLibro && <span className="error-message">{errors.autorLibro}</span>}
                            </div>
                            <button className="submit-btn" onClick={crearLibro}>Crear Libro</button>
                        </div>
                    </div>
                );
            case 'consultar':
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Consultar Libro</h2>
                        <div className="form-container">
                            <div className="form-group">
                                <label>ID del Libro *</label>
                                <input
                                    type="text"
                                    value={libroID}
                                    onChange={(e) => setLibroID(e.target.value)}
                                    placeholder="Ingresa el ID numérico del libro"
                                    className={errors.libroID ? 'input-error' : ''}
                                />
                                {errors.libroID && <span className="error-message">{errors.libroID}</span>}
                            </div>
                            <button className="submit-btn" onClick={consultarLibroPorID}>Consultar</button>
                            
                            {libroConsultado && (
                                <div className="book-details">
                                    <h3>Detalles del Libro</h3>
                                    <p><strong>Título:</strong> {libroConsultado.titulo}</p>
                                    <p><strong>Fecha Publicación:</strong> {new Date(libroConsultado.fechaPublicacion).toLocaleDateString()}</p>
                                    <p><strong>Autor ID:</strong> {libroConsultado.autorLibro}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Eliminar el navbar interno del return
return (
  <div className="libro-material-container">
    {/* Eliminado: <nav className="navbar">...</nav> */}
    
    <main className="main-content">
      {renderTabContent()}
    </main>
  </div>
);
};

export default LibroMaterial;