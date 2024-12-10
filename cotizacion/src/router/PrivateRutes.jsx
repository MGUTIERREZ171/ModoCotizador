import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { validarToken } from '../auth/validarToken';

export const PrivateRoutes = () => {
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const validateToken = async () => {
            const valid = await validarToken();
            setIsValid(valid);
        };
        validateToken();
    }, []);

    if (isValid === null) return <p>Cargando...</p>; // Muestra un cargando mientras se valida el token

    return isValid ? <Outlet /> : <Navigate to="/" />;
};
