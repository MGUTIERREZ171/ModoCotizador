import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoutes = () => {
    const token = localStorage.getItem('token'); // Verifica si hay un token en localStorage

    // Si no hay token, redirige al login
    return token ? <Outlet /> : <Navigate to="/" />;
};
