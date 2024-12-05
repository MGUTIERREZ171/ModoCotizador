// utils/tokenUtils.js
import * as jwt_decode from 'jwt-decode';

export const validarToken = (token) => {
    try {
        const { exp } = jwt_decode(token); // Accede directamente a la función sin .default
        const currentTime = Math.floor(Date.now() / 1000); // Obtiene el tiempo actual en segundos
        return exp > currentTime; // Si el token no ha expirado, es válido
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return false; // Si algo falla, el token no es válido
    }
};
