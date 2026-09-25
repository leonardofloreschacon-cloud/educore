import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Calificaciones() {
  const [calificaciones, setCalificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerCalificaciones();
  }, []);

  const obtenerCalificaciones = async () => {
    setCargando(true);
    try {
      // Consultamos la tabla 'calificaciones' en Supabase
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

        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-teal-500 p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Alumno</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Nota Final</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              
              {cargando && <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Cargando base de datos académica...</td></tr>}
              {!cargando && calificaciones.length === 0 && <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Los profesores aún no han registrado calificaciones.</td></tr>}

              {!cargando && calificaciones.map((registro) => {
                // Validación para pintar de rojo si está reprobado (nota menor a 11 o 13 dependiendo de tu escala)
                const esReprobado = Number(registro.nota) < 13; 

                return (
                  <tr key={registro.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registro.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Alumno #{registro.alumno_id}
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