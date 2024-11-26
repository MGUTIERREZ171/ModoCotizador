import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginScreen.css';

export const LoginScreen = () => {
    const [form, setForm] = useState({ usuario: '', password: '' });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login `, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('nombre', data.nombre);
                localStorage.setItem('idUsuario', data.id);
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Login Exitoso",
                    showConfirmButton: false,
                    timer: 1000
                });

                setTimeout(() => {
                    navigate('/modocotizador');
                }, 800);

            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Error al iniciar sesión.', 'error');
            }

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
        }
    };

    return (
        <div className=" login-container">
            <div className="row">
                <div className="col-md-6 login-form-1">
                    <h3>Ingreso</h3>
                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Usuario"
                                name="usuario"
                                value={form.usuario}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Contraseña"
                                name="password"
                                value={form.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group mb-2">
                            <input
                                type="submit"
                                className="btnSubmit"
                                value="Login"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
