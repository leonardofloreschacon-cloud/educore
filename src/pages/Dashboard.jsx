import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    alumnos: 0,
    profesores: 0,
    presentesHoy: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMetricas();
  }, []);

  const obtenerMetricas = async () => {
    setCargando(true);
    try {
      // 1. Contar total de estudiantes
      const { count: countAlumnos } = await supabase
        .from('estudiantes')
        .select('*', { count: 'exact', head: true });

      // 2. Contar total de profesores
      const { count: countProfesores } = await supabase
        .from('profesores')
        .select('*', { count: 'exact', head: true });

      // 3. Contar asistencias de hoy (Solo los "Presente")
      const fechaHoy = new Date().toISOString().split('T')[0];
      const { count: countAsistencias } = await supabase
        .from('asistencias')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', fechaHoy)
        .eq('estado', 'Presente');

      setEstadisticas({
        alumnos: countAlumnos || 0,
        profesores: countProfesores || 0,
        presentesHoy: countAsistencias || 0
      });
    } catch (error) {
      console.error("Error al cargar métricas:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    // Si usas Supabase Auth: await supabase.auth.signOut();
    navigate('/'); // Redirige al login
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera del Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex justify-between items-center border-l-4 border-indigo-600">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
            <p className="text-gray-500 mt-1">Has ingresado exitosamente al sistema administrativo de EduCore.</p>
          </div>
          <button 
            onClick={cerrarSesion}
            className="border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tarjetas de Métricas (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Alumnos</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{cargando ? '...' : estadisticas.alumnos}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-500 text-2xl">🎓</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Docentes</p>
              <p className="text-3xl font-black text-green-600 mt-2">{cargando ? '...' : estadisticas.profesores}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-500 text-2xl">👨‍🏫</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Asistencia Hoy</p>
              <p className="text-3xl font-black text-purple-600 mt-2">{cargando ? '...' : estadisticas.presentesHoy}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-500 text-2xl">✅</div>
          </div>
        </div>

        {/* Menú de Módulos (Accesos Directos) */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Módulos Administrativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Link to="/alumnos" className="bg-blue-50 border border-blue-100 rounded-lg p-6 hover:shadow-md transition-all group">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Alumnos</h3>
            <p className="text-sm text-blue-700 mb-4">Gestionar matriculados y perfiles</p>
            <span className="text-blue-600 text-sm font-semibold group-hover:underline">Ingresar al módulo →</span>
          </Link>

          <Link to="/profesores" className="bg-green-50 border border-green-100 rounded-lg p-6 hover:shadow-md transition-all group">
            <h3 className="text-lg font-bold text-green-900 mb-2">Profesores</h3>
            <p className="text-sm text-green-700 mb-4">Gestionar plana docente</p>
            <span className="text-green-600 text-sm font-semibold group-hover:underline">Ingresar al módulo →</span>
          </Link>

          <Link to="/asistencias" className="bg-purple-50 border border-purple-100 rounded-lg p-6 hover:shadow-md transition-all group">
            <h3 className="text-lg font-bold text-purple-900 mb-2">Auditoría de Asistencias</h3>
            <p className="text-sm text-purple-700 mb-4">Supervisar reportes diarios</p>
            <span className="text-purple-600 text-sm font-semibold group-hover:underline">Ingresar al módulo →</span>
          </Link>

          <Link to="/comunicados" className="bg-orange-50 border border-orange-100 rounded-lg p-6 hover:shadow-md transition-all group">
            <h3 className="text-lg font-bold text-orange-900 mb-2">Comunicados</h3>
            <p className="text-sm text-orange-700 mb-4">Publicar anuncios institucionales</p>
            <span className="text-orange-600 text-sm font-semibold group-hover:underline">Ingresar al módulo →</span>
          </Link>

          {/* Opcional: Enlace para el módulo de Calificaciones que haremos después */}
          <Link to="/calificaciones" className="bg-teal-50 border border-teal-100 rounded-lg p-6 hover:shadow-md transition-all group lg:col-span-2">
            <h3 className="text-lg font-bold text-teal-900 mb-2">Supervisión de Calificaciones</h3>
            <p className="text-sm text-teal-700 mb-4">Auditar el rendimiento académico registrado por los docentes.</p>
            <span className="text-teal-600 text-sm font-semibold group-hover:underline">Ingresar al módulo →</span>
          </Link>

        </div>

      </div>
    </div>
  );
}