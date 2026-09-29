import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState(''); // Nuevo estado para el correo
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  const obtenerEstudiantes = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setEstudiantes(data);
    } catch (error) {
      console.error("Error al traer estudiantes:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarEstudiante = async (e) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim() || !correo.trim()) {
      alert("Por favor complete todos los campos, incluyendo el correo.");
      return;
    }

    try {
      // Ahora enviamos también el correo a la tabla
      const { error } = await supabase
        .from('estudiantes')
        .insert([{ nombres, apellidos, correo }]);

      if (error) throw error;

      // Limpiamos el formulario y recargamos la tabla
      setNombres('');
      setApellidos('');
      setCorreo('');
      obtenerEstudiantes();
      alert("Estudiante registrado exitosamente.");
    } catch (error) {
      console.error("Error al guardar:", error.message);
      alert("Hubo un error al guardar al estudiante.");
    }
  };

  const eliminarEstudiante = async (id) => {
    if(!window.confirm("¿Estás seguro de eliminar a este estudiante?")) return;
    try {
      const { error } = await supabase.from('estudiantes').delete().eq('id', id);
      if (error) throw error;
      obtenerEstudiantes();
    } catch (error) {
      console.error("Error al eliminar:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Módulo de Estudiantes</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-t-4 border-green-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Registrar Nuevo Estudiante</h2>
          <form onSubmit={guardarEstudiante} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <input 
                type="text" 
                placeholder="Nombres" 
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Apellidos" 
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            {/* NUEVO CAMPO DE CORREO */}
            <div>
              <input 
                type="email" 
                placeholder="Correo Electrónico" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <button 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>

        {/* TABLA DE ESTUDIANTES */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto border-t-4 border-blue-500 p-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombres</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Apellidos</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cargando && <tr><td colSpan="4" className="px-6 py-4 text-center">Cargando...</td></tr>}
              {!cargando && estudiantes.length === 0 && <tr><td colSpan="4" className="px-6 py-4 text-center">No hay estudiantes registrados.</td></tr>}
              {!cargando && estudiantes.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{alumno.nombres}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{alumno.apellidos}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{alumno.correo || 'Sin correo asignado'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <button className="text-blue-600 hover:text-blue-800 font-medium mr-4">Editar</button>
                    <button onClick={() => eliminarEstudiante(alumno.id)} className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
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