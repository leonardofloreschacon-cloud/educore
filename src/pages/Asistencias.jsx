import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Asistencias() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Fecha actual en formato YYYY-MM-DD para la base de datos
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechaHoy);
  const [guardandoId, setGuardandoId] = useState(null);

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  // 1. Traemos a todos los estudiantes de la tabla unificada 'estudiantes'
  const obtenerEstudiantes = async () => {
    try {
      const { data, error } = await supabase.from('estudiantes').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (data) setEstudiantes(data);
    } catch (error) {
      console.error("Error al traer los estudiantes:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // 2. Función para registrar la asistencia en Supabase
  const registrarAsistencia = async (estudiante, estadoAsistencia) => {
    setGuardandoId(estudiante.id);
    try {
      const nombreCompleto = `${estudiante.nombres || ''} ${estudiante.apellidos || ''}`.trim();

      const { error } = await supabase
        .from('asistencias') // Asegúrate de que tu tabla en Supabase se llame 'asistencias'
        .insert([
          {
            fecha: fechaSeleccionada,
            alumno_id: estudiante.id,
            alumno_nombre: nombreCompleto,
            estado: estadoAsistencia
          }
        ]);

      if (error) throw error;
      alert(`¡Asistencia registrada como "${estadoAsistencia}" para ${nombreCompleto}!`);
    } catch (error) {
      alert("Error al registrar asistencia: " + error.message);
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">Módulo de Asistencias</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* Selector de Fecha */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Fecha:</label>
          <input 
            type="date" 
            value={fechaSeleccionada} 
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500"
          />
        </div>

        {/* Tabla Dinámica con los Estudiantes de Supabase */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-purple-600">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado de Asistencia</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">Cargando lista de estudiantes...</td></tr>}
              {!cargando && estudiantes.length === 0 && <tr><td colSpan="2" className="px-6 py-4 text-center text-sm text-gray-500">No hay estudiantes registrados.</td></tr>}

              {!cargando && estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {estudiante.nombres} {estudiante.apellidos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center gap-2">
                      <button 
                        disabled={guardandoId === estudiante.id}
                        onClick={() => registrarAsistencia(estudiante, 'Presente')}
                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                      >
                        Presente
                      </button>
                      <button 
                        disabled={guardandoId === estudiante.id}
                        onClick={() => registrarAsistencia(estudiante, 'Tardanza')}
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                      >
                        Tardanza
                      </button>
                      <button 
                        disabled={guardandoId === estudiante.id}
                        onClick={() => registrarAsistencia(estudiante, 'Falta')}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                      >
                        Falta
                      </button>
                    </div>
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