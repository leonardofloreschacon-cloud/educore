import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Dashboard() {
  const navigate = useNavigate();

  // Función para cerrar sesión en Supabase
  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error al cerrar sesión");
    } else {
      navigate('/login'); // Nos devuelve a la pantalla de entrada
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
        
        {/* Cabecera con botón de salir */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-blue-900">Panel Principal</h1>
          <button 
            onClick={cerrarSesion}
            className="bg-red-50 text-red-600 px-4 py-2 rounded border border-red-200 hover:bg-red-100 transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <p className="text-gray-600">Has ingresado exitosamente al sistema administrativo de EduCore.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            to="/alumnos" 
            className="bg-blue-50 p-4 rounded border border-blue-100 hover:bg-blue-100 hover:shadow transition-all cursor-pointer block"
          >
            <h2 className="text-lg font-bold text-blue-800">Alumnos</h2>
            <p className="text-sm text-blue-600 mt-1">Gestionar matriculados →</p>
          </Link>
          
          {/* Nuevo enlace al módulo de Profesores */}
          <Link 
            to="/profesores" 
            className="bg-green-50 p-4 rounded border border-green-100 hover:bg-green-100 hover:shadow transition-all cursor-pointer block"
          >
            <h2 className="text-lg font-bold text-green-800">Profesores</h2>
            <p className="text-sm text-green-600 mt-1">Gestionar docentes →</p>
          </Link>

          <div className="bg-purple-50 p-4 rounded border border-purple-100">
            <h2 className="text-lg font-bold text-purple-800">Asistencias</h2>
            <Link 
            to="/asistencias" 
            className="bg-purple-50 p-4 rounded border border-purple-100 hover:bg-purple-100 hover:shadow transition-all cursor-pointer block"
          >
            <h2 className="text-lg font-bold text-purple-800">Asistencias</h2>
            <p className="text-sm text-purple-600 mt-1">Control diario →</p>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}