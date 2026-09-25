import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [carrera, setCarrera] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  const [idEditando, setIdEditando] = useState(null);

  useEffect(() => {
    obtenerAlumnos();
  }, []);

  const obtenerAlumnos = async () => {
    try {
      // CAMBIO AQUÍ: de 'alumnos' a 'estudiantes'
      const { data, error } = await supabase.from('estudiantes').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setAlumnos(data);
    } catch (error) {
      console.error("Error al traer los estudiantes:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const activarEdicion = (alumno) => {
    setNombre(alumno.nombre);
    setDni(alumno.dni);
    setCarrera(alumno.carrera);
    setIdEditando(alumno.id);
  };

  const cancelarEdicion = () => {
    setNombre('');
    setDni('');
    setCarrera('');
    setIdEditando(null);
  };

  const guardarAlumno = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      if (idEditando) {
        // CAMBIO AQUÍ: de 'alumnos' a 'estudiantes'
        const { error } = await supabase
          .from('estudiantes')
          .update({ nombre: nombre, dni: dni, carrera: carrera })
          .eq('id', idEditando);
          
        if (error) throw error;
      } else {
        // CAMBIO AQUÍ: de 'alumnos' a 'estudiantes'
        const { error } = await supabase
          .from('estudiantes')
          .insert([{ nombre: nombre, dni: dni, carrera: carrera }]);
          
        if (error) throw error;
      }

      cancelarEdicion();
      obtenerAlumnos();
      
    } catch (error) {
      alert("Hubo un error al guardar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarAlumno = async (id, nombreAlumno) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar a ${nombreAlumno}?`);
    if (confirmar) {
      try {
        // CAMBIO AQUÍ: de 'alumnos' a 'estudiantes'
        const { error } = await supabase.from('estudiantes').delete().eq('id', id);
        if (error) throw error;
        obtenerAlumnos();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Módulo de Alumnos (Estudiantes)</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 ${idEditando ? 'border-yellow-500' : 'border-green-500'}`}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {idEditando ? 'Editar Estudiante' : 'Matricular Nuevo Estudiante'}
          </h2>
          
          <form onSubmit={guardarAlumno} className="flex flex-col md:flex-row gap-4 items-center">
            <input 
              type="text" placeholder="Nombre completo" required 
              value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
            <input 
              type="text" placeholder="DNI" required maxLength="8"
              value={dni} onChange={(e) => setDni(e.target.value)}
              className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            />
            <select 
              required value={carrera} onChange={(e) => setCarrera(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>Selecciona una carrera...</option>
              <option value="Diseño y Programación Web">Diseño y Programación Web</option>
              <option value="Enfermería Técnica">Enfermería Técnica</option>
              <option value="Mecánica Automotriz">Mecánica Automotriz</option>
            </select>
            
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

        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-blue-600">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Cargando base de datos...</td></tr>}
              {!cargando && alumnos.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No hay estudiantes registrados aún.</td></tr>}

              {!cargando && alumnos.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alumno.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alumno.dni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alumno.carrera}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => activarEdicion(alumno)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarAlumno(alumno.id, alumno.nombre)}
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