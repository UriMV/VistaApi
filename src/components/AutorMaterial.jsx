import React, { useState, useEffect } from 'react';
import '../css/AutorMaterial.css';

const AutorMaterial = () => {
    const [autores, setAutores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [autorID, setAutorID] = useState('');
    const [autorConsultado, setAutorConsultado] = useState(null);
    const [activeTab, setActiveTab] = useState('listar');
    const [errors, setErrors] = useState({
        nombre: '',
        apellido: '',
        fechaNacimiento: '',
        autorID: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'listar') {
            obtenerAutores();
        }
    }, [activeTab, successMessage]);

    const obtenerAutores = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("https://autorapiweb.somee.com/api/Autor");
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            setAutores(data);
        } catch (error) {
            console.error("Error detallado al obtener autores:", error);
            alert('Error al obtener autores: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            nombre: '',
            apellido: '',
            fechaNacimiento: '',
            autorID: ''
        };

        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
            valid = false;
        }

        if (!apellido.trim()) {
            newErrors.apellido = 'El apellido es requerido';
            valid = false;
        }

        if (!fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
            valid = false;
        } else if (new Date(fechaNacimiento) > new Date()) {
            newErrors.fechaNacimiento = 'La fecha no puede ser futura';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const validateConsultForm = () => {
        let valid = true;
        const newErrors = {
            ...errors,
            autorID: ''
        };

        if (!autorID.trim()) {
            newErrors.autorID = 'El ID del autor es requerido';
            valid = false;
        } 
        setErrors(newErrors);
        return valid;
    };

    const crearAutor = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const nuevoAutor = {
                nombre,
                apellido,
                fechaNacimiento: new Date(fechaNacimiento).toISOString()
            };

            const response = await fetch("https://autorapiweb.somee.com/api/Autor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoAutor)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el autor');
            }

            // Resetear formulario
            setNombre('');
            setApellido('');
            setFechaNacimiento('');
            setErrors({
                nombre: '',
                apellido: '',
                fechaNacimiento: '',
                autorID: ''
            });
            
            setSuccessMessage("¡Autor creado exitosamente!");
            setTimeout(() => setSuccessMessage(''), 3000);
            setActiveTab('listar');
        } catch (error) {
            console.error("Error en la creación:", error);
            alert("Ocurrió un error al crear el autor: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const consultarAutorPorID = async () => {
        if (!validateConsultForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`https://autorapiweb.somee.com/api/Autor/${autorID}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Autor no encontrado');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const data = await response.json();
            setAutorConsultado(data);
        } catch (error) {
            console.error("Error al consultar autor:", error);
            alert(`Error al consultar el autor: ${error.message}`);
            setAutorConsultado(null);
        } finally {
            setIsLoading(false);
        }
    };

    const buscarAutores = () => {
    if (!searchTerm.trim()) return autores;
    
    return autores.filter(autor => {
        // Verificar que autor existe y tiene las propiedades necesarias
        if (!autor) return false;
        
        const id = autor.autorLibroId ? autor.autorLibroId.toString() : '';
        const nombre = autor.nombre ? autor.nombre.toLowerCase() : '';
        const apellido = autor.apellido ? autor.apellido.toLowerCase() : '';
        
        return (
            nombre.includes(searchTerm.toLowerCase()) ||
            apellido.includes(searchTerm.toLowerCase()) ||
            id.includes(searchTerm)
        );
    });
};
    const renderTabContent = () => {
        switch (activeTab) {
            case 'listar':
                const autoresFiltrados = buscarAutores();
                
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Lista de Autores</h2>
                        
                        {/* Barra de búsqueda */}
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button 
                                className="search-btn"
                                onClick={() => setSearchTerm('')}
                                disabled={!searchTerm}
                            >
                                Limpiar
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="loading-indicator">Cargando autores...</div>
                        ) : autoresFiltrados.length === 0 ? (
                            <div className="no-data-message">
                                {searchTerm ? (
                                    <>
                                        <p>No se encontraron autores con "{searchTerm}"</p>
                                        <button 
                                            className="refresh-btn" 
                                            onClick={() => setSearchTerm('')}
                                        >
                                            Mostrar todos
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p>No se encontraron autores</p>
                                        <button 
                                            className="refresh-btn" 
                                            onClick={obtenerAutores}
                                        >
                                            Intentar nuevamente
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="results-count">
                                    Mostrando {autoresFiltrados.length} de {autores.length} autores
                                </div>
                                <div className="authors-grid">
                                    {autoresFiltrados.map((autor, index) => (
                                        <div key={index} className="author-card">
                                            <div className="author-avatar">
                                                {autor.nombre.charAt(0)}{autor.apellido.charAt(0)}
                                            </div>
                                            <div className="author-info">
                                                <h3>{autor.nombre} {autor.apellido}</h3>
                                                <p><strong>Nacimiento:</strong> {new Date(autor.fechaNacimiento).toLocaleDateString()}</p>
                                                <p><strong>ID:</strong> {autor.autorLibroId}</p>
                                            </div>
                                            <button 
                                                className="view-details-btn"
                                                onClick={() => {
                                                    setAutorID(autor.autorLibroId);
                                                    setActiveTab('consultar');
                                                }}
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'crear':
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Crear Nuevo Autor</h2>
                        {successMessage && (
                            <div className="success-message">
                                {successMessage}
                            </div>
                        )}
                        <div className="form-container">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del autor"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className={errors.nombre ? 'input-error' : ''}
                                />
                                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                            </div>
                            <div className="form-group">
                                <label>Apellido *</label>
                                <input
                                    type="text"
                                    placeholder="Apellido del autor"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    className={errors.apellido ? 'input-error' : ''}
                                />
                                {errors.apellido && <span className="error-message">{errors.apellido}</span>}
                            </div>
                            <div className="form-group">
                                <label>Fecha de Nacimiento *</label>
                                <input
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    className={errors.fechaNacimiento ? 'input-error' : ''}
                                />
                                {errors.fechaNacimiento && <span className="error-message">{errors.fechaNacimiento}</span>}
                            </div>
                            <div className="form-actions">
                                <button 
                                    className="submit-btn" 
                                    onClick={crearAutor}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creando...' : 'Crear Autor'}
                                </button>
                                <button 
                                    className="clear-btn"
                                    onClick={() => {
                                        setNombre('');
                                        setApellido('');
                                        setFechaNacimiento('');
                                        setErrors({
                                            nombre: '',
                                            apellido: '',
                                            fechaNacimiento: '',
                                            autorID: ''
                                        });
                                    }}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'consultar':
                return (
                    <div className="tab-content">
                        <h2 className="section-title">Consultar Autor por UUID</h2>
                        <div className="form-container">
                            <div className="form-group">
                                <label>ID del Autor *</label>
                                <input
                                    type="text"
                                    value={autorID}
                                    onChange={(e) => setAutorID(e.target.value)}
                                    placeholder="Ingresa el ID del autor"
                                    className={errors.autorID ? 'input-error' : ''}
                                />
                                {errors.autorID && <span className="error-message">{errors.autorID}</span>}
                            </div>
                            <div className="form-actions">
                                <button 
                                    className="submit-btn" 
                                    onClick={consultarAutorPorID}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Buscando...' : 'Buscar Autor'}
                                </button>
                                <button 
                                    className="back-btn" 
                                    onClick={() => {
                                        setActiveTab('listar');
                                        setAutorConsultado(null);
                                    }}
                                >
                                    Volver a la lista
                                </button>
                            </div>
                            
                            {autorConsultado && (
                                <div className="author-details">
                                    <div className="author-header">
                                        <div className="author-avatar large">
                                            {autorConsultado.nombre.charAt(0)}{autorConsultado.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <h3>{autorConsultado.nombre} {autorConsultado.apellido}</h3>
                                            <p className="author-id">ID: {autorConsultado.autorLibroId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <strong>Fecha de Nacimiento:</strong>
                                        <span>{new Date(autorConsultado.fechaNacimiento).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="autor-material-container">
            <div className="tabs">
                <button 
                    className={`tab-btn ${activeTab === 'listar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listar')}
                >
                    Listar Autores
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'crear' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crear')}
                >
                    Crear Autor
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'consultar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('consultar')}
                >
                    Buscar Autor por UUID
                </button>
            </div>
            
            <main className="main-content">
                {renderTabContent()}
            </main>
            
            <footer className="footer">
                <p>Microservicio: autorapiweb.somee.com | © {new Date().getFullYear()} Gestión de Autores</p>
            </footer>
        </div>
    );
};

export default AutorMaterial;