import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase'; // Importamos la conexión

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Profesores from './pages/Profesores';
import Asistencias from './pages/Asistencias';

function App() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Verificamos si ya hay una sesión iniciada al recargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    // 2. Nos quedamos escuchando si el usuario entra o cierra sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    // Limpieza del espía cuando se cierra la app
    return () => subscription.unsubscribe();
  }, []);

  // Mientras verifica la identidad, mostramos un pequeño texto de carga
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-medium text-blue-900">Verificando seguridad...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Si hay sesión va al panel, si no, al login */}
        <Route path="/" element={sesion ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        
        {/* Ruta de Login: Si ya está logueado, no lo dejamos ver el login de nuevo */}
        <Route path="/login" element={!sesion ? <Login /> : <Navigate to="/dashboard" replace />} />
        
        {/* 🛡️ RUTAS PROTEGIDAS: Solo entran si "sesion" tiene datos */}
        <Route path="/dashboard" element={sesion ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/alumnos" element={sesion ? <Alumnos /> : <Navigate to="/login" replace />} />
        <Route path="/profesores" element={sesion ? <Profesores /> : <Navigate to="/login" replace />} />
        
        <Route path="/comunicados" element={<Comunicados />} />
        <Route path="/calificaciones" element={<Calificaciones />} />
        
        <Route path="/asistencias" element={sesion ? <Asistencias /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;