import React from 'react';
import Swal from 'sweetalert2';
import { CotizacionScreen } from '../screens/CotizacionScreen';

export const CreditoRutas = () => {
    const obtenerCreditos = async (idCredito) => {
        try {
            const token = localStorage.getItem('token'); // Obtener el token
            const response = await fetch(`${import.meta.env.VITE_API_URL}/obtener-credito?idCredito=${idCredito}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-key': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json();
                Swal.fire('Credito no valido', errorData.message || 'Ingrese un numero de credito valido', 'warning');
                return null;
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            Swal.fire('Error', 'Hubo un problema al conectar con el servidor.', 'error');
            return null;
        }
    };

    return <CotizacionScreen obtenerCreditos={obtenerCreditos} />;
};
