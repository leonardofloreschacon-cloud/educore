import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Establecer la fecha actual por defecto para el filtro
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [fechaFiltro, setFechaFiltro] = useState(fechaHoy);

  // Estado para los contadores (Estadísticas rápidas)
  const [estadisticas, setEstadisticas] = useState({ presentes: 0, tardanzas: 0, faltas: 0 });

  // Cuando cambie la fecha, volvemos a consultar a la base de datos
  useEffect(() => {
    obtenerAsistencias();
  }, [fechaFiltro]);

  const obtenerAsistencias = async () => {
    setCargando(true);
    try {
      // 1. Consultar la tabla "asistencias" filtrando por la fecha seleccionada
      const { data, error } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', fechaFiltro)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAsistencias(data);
        
        // 2. Calcular estadísticas automáticas para el Administrador
        const presentes = data.filter(a => a.estado === 'Presente').length;
        const tardanzas = data.filter(a => a.estado === 'Tardanza').length;
        const faltas = data.filter(a => a.estado === 'Falta').length;
        setEstadisticas({ presentes, tardanzas, faltas });
      }
    } catch (error) {
      console.error("Error al traer las asistencias:", error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-900">Auditoría de Asistencias</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* Panel Superior: Filtro y Estadísticas Diarias */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 border-t-4 border-purple-500">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-bold text-gray-700 mb-2">Filtrar por Fecha:</label>
            <input 
              type="date" 
              value={fechaFiltro} 
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 w-full"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto justify-between">
            <div className="bg-green-50 px-6 py-3 rounded-lg text-center border border-green-200 flex-1">
              <p className="text-xs text-green-600 font-bold uppercase">Presentes</p>
              <p className="text-2xl font-black text-green-700">{estadisticas.presentes}</p>
            </div>
            <div className="bg-yellow-50 px-6 py-3 rounded-lg text-center border border-yellow-200 flex-1">
              <p className="text-xs text-yellow-600 font-bold uppercase">Tardanzas</p>
              <p className="text-2xl font-black text-yellow-700">{estadisticas.tardanzas}</p>
            </div>
            <div className="bg-red-50 px-6 py-3 rounded-lg text-center border border-red-200 flex-1">
              <p className="text-xs text-red-600 font-bold uppercase">Faltas</p>
              <p className="text-2xl font-black text-red-700">{estadisticas.faltas}</p>
            </div>
          </div>
        </div>

        {/* Tabla de Solo Lectura para el Administrador */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado Reportado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">Consultando registros en la base de datos...</td></tr>}
              {!cargando && asistencias.length === 0 && <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No hay asistencias registradas por los docentes en esta fecha.</td></tr>}

              {!cargando && asistencias.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {registro.alumno_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${registro.estado === 'Presente' ? 'bg-green-100 text-green-800' : ''}
                      ${registro.estado === 'Tardanza' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${registro.estado === 'Falta' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {registro.estado}
                    </span>
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