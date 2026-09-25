import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [periodoFiltro, setPeriodoFiltro] = useState('');

  useEffect(() => {
    obtenerCalificaciones();
  }, []);

  const obtenerCalificaciones = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCalificaciones(data);
    } catch (error) {
      console.error("Error al traer las calificaciones:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // Lista única de cursos y periodos para los selectores de filtro
  const listaCursosUnicos = [...new Set(calificaciones.map(item => item.curso))];
  const listaPeriodosUnicos = [...new Set(calificaciones.map(item => item.periodo))];

  // Filtrado reactivo de calificaciones
  const calificacionesFiltradas = calificaciones.filter((registro) => {
    const nombreAlumno = (registro.alumno_nombre || `Alumno #${registro.alumno_id}`).toLowerCase();
    const coincideNombre = nombreAlumno.includes(busquedaAlumno.toLowerCase());
    const coincideCurso = cursoFiltro === '' || registro.curso === cursoFiltro;
    const coincidePeriodo = periodoFiltro === '' || registro.periodo === periodoFiltro;

    return coincideNombre && coincideCurso && coincidePeriodo;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-900">Auditoría de Calificaciones</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* BARRA DE FILTROS PROFESIONAL */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t-4 border-teal-500">
          
          {/* 1. Buscar por Estudiante */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filtrar por Estudiante</label>
            <input 
              type="text" 
              placeholder="Escribe el nombre..." 
              value={busquedaAlumno}
              onChange={(e) => setBusquedaAlumno(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* 2. Filtrar por Curso */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filtrar por Curso</label>
            <select 
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Todos los cursos</option>
              {listaCursosUnicos.map((curso, index) => (
                <option key={index} value={curso}>{curso}</option>
              ))}
            </select>
          </div>

          {/* 3. Filtrar por Periodo */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Filtrar por Periodo</label>
            <select 
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Todos los periodos</option>
              {listaPeriodosUnicos.map((periodo, index) => (
                <option key={index} value={periodo}>{periodo}</option>
              ))}
            </select>
          </div>

        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Nota Final</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Cargando base de datos académica...</td></tr>}
              
              {!cargando && calificaciones.length === 0 && <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Los profesores aún no han registrado calificaciones.</td></tr>}

              {!cargando && calificaciones.length > 0 && calificacionesFiltradas.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No se encontraron registros con los filtros seleccionados.</td></tr>
              )}

              {!cargando && calificacionesFiltradas.map((registro) => {
                const esReprobado = Number(registro.nota) < 13; 

                return (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registro.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {registro.alumno_nombre || `Alumno #${registro.alumno_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {registro.curso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {registro.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-md ${esReprobado ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {registro.nota}
                      </span>
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