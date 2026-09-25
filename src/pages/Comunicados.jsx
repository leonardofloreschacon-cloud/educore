import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Comunicados() {
  const [comunicados, setComunicados] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerComunicados();
  }, []);

  // 1. Obtener los comunicados de Supabase para ver el historial
  const obtenerComunicados = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('comunicados')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar del más nuevo al más viejo

      if (error) throw error;
      if (data) setComunicados(data);
    } catch (error) {
      console.error("Error al traer los comunicados:", error.message);
    } finally {
      setCargando(false);
    }
  };

  // 2. Publicar un nuevo comunicado a Supabase
  const publicarComunicado = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    // Obtener la fecha actual en formato legible o YYYY-MM-DD
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('comunicados')
        .insert([{ titulo: titulo, contenido: contenido, fecha: fechaHoy }]);
        
      if (error) throw error;

      alert("¡Comunicado publicado con éxito para toda la escuela!");
      setTitulo('');
      setContenido('');
      obtenerComunicados(); // Recargar la lista
      
    } catch (error) {
      alert("Hubo un error al publicar: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  // 3. Eliminar un comunicado si hubo un error
  const eliminarComunicado = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este comunicado?");
    if (confirmar) {
      try {
        const { error } = await supabase.from('comunicados').delete().eq('id', id);
        if (error) throw error;
        obtenerComunicados();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Gestión de Comunicados</h1>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors font-medium"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* Formulario para publicar anuncios */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Redactar Nuevo Anuncio</h2>
          <form onSubmit={publicarComunicado} className="flex flex-col gap-4">
            <input 
              type="text" placeholder="Título del comunicado (Ej: Inicio de Exámenes)" required 
              value={titulo} onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 font-medium"
            />
            <textarea 
              placeholder="Escribe el contenido del mensaje para los alumnos y docentes..." required 
              rows="4"
              value={contenido} onChange={(e) => setContenido(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 resize-none"
            ></textarea>
            
            <div className="flex justify-end">
              <button 
                type="submit" disabled={guardando}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md transition-colors font-bold shadow-sm"
              >
                {guardando ? 'Publicando...' : 'Publicar Anuncio'}
              </button>
            </div>
          </form>
        </div>

        {/* Historial de comunicados publicados */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Publicaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cargando && <p className="text-gray-500 col-span-full">Cargando comunicados...</p>}
          {!cargando && comunicados.length === 0 && <p className="text-gray-500 col-span-full">Aún no has publicado ningún comunicado.</p>}

          {!cargando && comunicados.map((nota) => (
            <div key={nota.id} className="bg-white rounded-lg shadow border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{nota.titulo}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{nota.fecha}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-4">{nota.contenido}</p>
              </div>
              <div className="flex justify-end border-t pt-3">
                <button 
                  onClick={() => eliminarComunicado(nota.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}