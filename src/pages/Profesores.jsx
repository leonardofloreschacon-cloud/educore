import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Profesores() {
  const [profesores, setProfesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  const [idEditando, setIdEditando] = useState(null);

  useEffect(() => {
    obtenerProfesores();
  }, []);

  const obtenerProfesores = async () => {
    try {
      const { data, error } = await supabase.from('profesores').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setProfesores(data);
    } catch (error) {
      console.error("Error al traer los profesores:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const activarEdicion = (profesor) => {
    setNombre(profesor.nombre || '');
    setEspecialidad(profesor.especialidad || '');
    setTelefono(profesor.telefono || '');
    setIdEditando(profesor.id);
  };

  const cancelarEdicion = () => {
    setNombre('');
    setEspecialidad('');
    setTelefono('');
    setIdEditando(null);
  };

  const guardarProfesor = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      if (idEditando) {
        const { error } = await supabase
          .from('profesores')
          .update({ nombre: nombre, especialidad: especialidad, telefono: telefono })
          .eq('id', idEditando);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profesores')
          .insert([{ nombre: nombre, especialidad: especialidad, telefono: telefono }]);
          
        if (error) throw error;
      }

      cancelarEdicion();
      obtenerProfesores();
      
    } catch (error) {
      alert("Hubo un error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProfesor = async (id, nombreProfesor) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al profesor ${nombreProfesor}?`);
    if (confirmar) {
      try {
        const { error } = await supabase.from('profesores').delete().eq('id', id);
        if (error) throw error;
        obtenerProfesores();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-900">Módulo de Profesores</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 ${idEditando ? 'border-yellow-500' : 'border-green-500'}`}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {idEditando ? 'Editar Profesor' : 'Registrar Nuevo Profesor'}
          </h2>
          
          <form onSubmit={guardarProfesor} className="flex flex-col md:flex-row gap-4 items-center">
            <input 
              type="text" placeholder="Nombre completo" required 
              value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
            />
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
              required
            >
              <option value="" disabled>Selecciona un curso...</option>
              <option value="Administración de un Sitio Web">Administración de un Sitio Web</option>
              <option value="Desarrollo de Aplicaciones Empresariales">Desarrollo de Aplicaciones Empresariales</option>
              <option value="Despliegue de Aplicaciones Móviles">Despliegue de Aplicaciones Móviles</option>
              <option value="Documentación en Sistemas">Documentación en Sistemas</option>
              <option value="Despliegue de Servicios Web">Despliegue de Servicios Web</option>
            </select>
            <input 
              type="text" placeholder="Teléfono" required maxLength="9"
              value={telefono} onChange={(e) => setTelefono(e.target.value)}
              className="w-full md:w-36 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500"
            />
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                type="submit" disabled={guardando}
                className={`flex-1 md:flex-none text-white px-6 py-2 rounded-md transition-colors font-medium ${idEditando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {guardando ? 'Guardando...' : (idEditando ? 'Actualizar' : 'Guardar')}
              </button>
              
              {idEditando && (
                <button 
                  type="button" onClick={cancelarEdicion}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-green-600">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Cargando base de datos...</td></tr>}
              {!cargando && profesores.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No hay profesores registrados aún.</td></tr>}

              {!cargando && profesores.map((profesor) => (
                <tr key={profesor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profesor.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profesor.especialidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profesor.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => activarEdicion(profesor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarProfesor(profesor.id, profesor.nombre)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}