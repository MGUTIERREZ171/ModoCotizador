import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { validarToken } from '../auth/validarToken';

export const PublicRoutes = () => {
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const validateToken = async () => {
            const valid = await validarToken();
            setIsValid(valid);
        };
        validateToken();
    }, []);

    if (isValid === null) return <p>Cargando...</p>;

    return isValid ? <Navigate to="/modocotizador" /> : <Outlet />;
};
