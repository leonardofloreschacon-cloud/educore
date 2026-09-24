import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Asistencias() {
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Obtenemos la fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(hoy);

  useEffect(() => {
    cargarDatos();
  }, [fecha]); // Si la fecha cambia, vuelve a cargar los datos

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // 1. Traemos la lista de todos los alumnos matriculados
      const { data: datosAlumnos, error: errorAlumnos } = await supabase
        .from('alumnos')
        .select('*')
        .order('nombre', { ascending: true });
      if (errorAlumnos) throw errorAlumnos;
      setAlumnos(datosAlumnos || []);

      // 2. Traemos las asistencias registradas SOLO en la fecha seleccionada
      const { data: datosAsistencias, error: errorAsistencias } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fecha);
      if (errorAsistencias) throw errorAsistencias;
      setAsistencias(datosAsistencias || []);

    } catch (error) {
      console.error("Error al cargar datos:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const registrarAsistencia = async (alumno, estadoSeleccionado) => {
    try {
      // Buscamos si ya existe un registro de este alumno hoy
      const registroExistente = asistencias.find(a => a.alumno_id === alumno.id);

      if (registroExistente) {
        // Si ya existe, lo ACTUALIZAMOS
        await supabase
          .from('asistencias')
          .update({ estado: estadoSeleccionado })
          .eq('id', registroExistente.id);
      } else {
        // Si no existe, CREAMOS uno nuevo
        await supabase
          .from('asistencias')
          .insert([{
            fecha: fecha,
            alumno_id: alumno.id,
            alumno_nombre: alumno.nombre,
            estado: estadoSeleccionado
          }]);
      }
      // Refrescamos la vista para ver el cambio de color
      cargarDatos();
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  // Función para saber qué color pintar el botón según el estado guardado
  const obtenerEstado = (alumnoId) => {
    const registro = asistencias.find(a => a.alumno_id === alumnoId);
    return registro ? registro.estado : null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">Módulo de Asistencias</h1>
          <Link to="/dashboard" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium">
            ← Volver al Panel
          </Link>
        </div>

        {/* Selector de Fecha */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-purple-500 flex items-center gap-4">
          <label className="font-bold text-gray-700">Seleccionar Fecha:</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Lista de Alumnos para Tomar Lista */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-blue-600">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrera</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado de Asistencia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">Cargando lista...</td></tr>}
              {!cargando && alumnos.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No hay alumnos registrados para tomar asistencia.</td></tr>}

              {!cargando && alumnos.map((alumno) => {
                const estadoActual = obtenerEstado(alumno.id);
                
                return (
                  <tr key={alumno.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{alumno.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alumno.carrera}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center gap-2">
                        {/* Botón Presente */}
                        <button 
                          onClick={() => registrarAsistencia(alumno, 'Presente')}
                          className={`px-3 py-1 rounded border font-medium transition-colors ${estadoActual === 'Presente' ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'}`}
                        >
                          Presente
                        </button>
                        {/* Botón Tardanza */}
                        <button 
                          onClick={() => registrarAsistencia(alumno, 'Tardanza')}
                          className={`px-3 py-1 rounded border font-medium transition-colors ${estadoActual === 'Tardanza' ? 'bg-yellow-500 text-white border-yellow-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-yellow-50'}`}
                        >
                          Tardanza
                        </button>
                        {/* Botón Falta */}
                        <button 
                          onClick={() => registrarAsistencia(alumno, 'Falta')}
                          className={`px-3 py-1 rounded border font-medium transition-colors ${estadoActual === 'Falta' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50'}`}
                        >
                          Falta
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}