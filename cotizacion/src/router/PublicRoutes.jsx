import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoutes = () => {
    const token = localStorage.getItem('token'); // Verifica si hay un token en localStorage

    // Si hay token, redirige a la ruta principal protegida
    return token ? <Navigate to="/creditosrutas" /> : <Outlet />;
};
