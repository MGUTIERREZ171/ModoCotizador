import React from 'react';
import Swal from 'sweetalert2';
import { CotizacionScreen } from '../screens/CotizacionScreen';

export const CreditoRutas = () => {

    const obtenerCreditos = async (idCredito) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Se agoto el tiempo de tu sesión',
                    text: 'Vuelve a inicar sesión',
                    showConfirmButton: true
                });
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
                return null;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/obtener-credito?idCredito=${idCredito}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-token': token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                const errorData = await response.json();

                if (errorData.errors && Array.isArray(errorData.errors)) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Este crédito no se puede modificar',
                        html: ` ${errorData.errors.map((error) => `<li>${error}</li>`).join('')}`,
                        confirmButtonText: 'Entendido',
                    });
                } else {
                    Swal.fire('Error', 'Ocurrió un problema con la solicitud.', 'error');
                }
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

