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
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .order('id', { ascending: true });
        
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
          .update({ nombre, especialidad, telefono })
          .eq('id', idEditando);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profesores')
          .insert([{ nombre, especialidad, telefono }]);
          
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
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar al docente ${nombreProfesor}?`);
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
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium shadow-sm"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* Formulario Optimizado con Grid y Labels */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 transition-colors duration-300 ${idEditando ? 'border-yellow-500 bg-yellow-50' : 'border-green-500'}`}>
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            {idEditando ? '✏️ Editando Perfil del Docente' : '👨‍🏫 Registrar Nuevo Profesor'}
          </h2>
          
          <form onSubmit={guardarProfesor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Nombre Completo</label>
              <input 
                type="text" placeholder="Ej: Ricardo Coello" required 
                value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>

            <div className="flex flex-col lg:col-span-1">
              <label className="text-sm font-bold text-gray-600 mb-1">Curso Asignado (Ciclo IV)</label>
              <select
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium cursor-pointer"
                required
              >
                <option value="" disabled>Seleccione un curso...</option>
                <option value="Administración de un Sitio Web">Administración de un Sitio Web</option>
                <option value="Desarrollo de Aplicaciones Empresariales">Desarrollo de Aplicaciones Empresariales</option>
                <option value="Despliegue de Aplicaciones Móviles">Despliegue de Aplicaciones Móviles</option>
                <option value="Documentación en Sistemas">Documentación en Sistemas</option>
                <option value="Despliegue de Servicios Web">Despliegue de Servicios Web</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-600 mb-1">Teléfono Móvil</label>
              <input 
                type="tel" placeholder="Ej: 987654321" required maxLength="9" pattern="[0-9]{9}"
                title="Debe ingresar exactamente 9 números"
                // Esta línea bloquea el ingreso de letras automáticamente:
                value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>
            
            <div className="flex gap-3 w-full h-[42px]">
              <button 
                type="submit" disabled={guardando}
                className={`flex-1 text-white px-4 py-2 rounded-md transition-colors font-bold shadow-sm flex items-center justify-center ${idEditando ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {guardando ? 'Guardando...' : (idEditando ? 'Actualizar' : 'Guardar')}
              </button>
              
              {idEditando && (
                <button 
                  type="button" onClick={cancelarEdicion}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-bold shadow-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de Resultados Mejorada */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-green-600">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Nombre del Docente</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Curso Asignado</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">Cargando plana docente desde la base de datos...</td></tr>}
              {!cargando && profesores.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">No hay profesores registrados aún en el sistema.</td></tr>}

              {!cargando && profesores.map((profesor) => (
                <tr key={profesor.id} className={`hover:bg-green-50 transition-colors ${idEditando === profesor.id ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{profesor.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs border border-green-200">
                      {profesor.especialidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{profesor.telefono}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button 
                      onClick={() => activarEdicion(profesor)}
                      className="text-blue-600 hover:text-blue-800 mr-3 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-md transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarProfesor(profesor.id, profesor.nombre)}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-md transition-colors"
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