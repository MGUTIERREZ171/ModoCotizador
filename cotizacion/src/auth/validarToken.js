export const validarToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/validate-token`, {
            headers: {
                'x-token': token,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.valid;
        }
        return false; // Si el servidor responde con error, el token no es válido
    } catch (error) {
        console.error('Error al validar el token:', error);
        return false;
    }
};
