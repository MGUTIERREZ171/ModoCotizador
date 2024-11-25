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
            const response = await fetch('http://192.168.0.104:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token); // Guardar token en localStorage
                localStorage.setItem('nombre', data.nombre); // Guardar nombre en localStorage
                localStorage.setItem('idUsuario', data.id); // Guardar nombre en localStorage
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Login Exitoso",
                    showConfirmButton: false,
                    timer: 1000
                });

                console.log(data.id);

                setTimeout(() => {
                    navigate('/modocotizador'); // Redirigir a la página de créditos
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
