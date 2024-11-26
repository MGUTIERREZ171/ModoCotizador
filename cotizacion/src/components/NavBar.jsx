import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/cotizacionScreen.css'

export const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: "¿Quieres cerrar sesión?",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Salir"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Se cerro sesión",
                    showConfirmButton: false,
                    timer: 1000
                });
                localStorage.removeItem('token');
                localStorage.removeItem('idUsuario');
                localStorage.removeItem('nombre');
                setTimeout(() => {
                    navigate('/');
                }, 800);
            }
        })
    };

    return (
        <nav className="navbar navbar-dark custom-navbar mb px-4">
            <span className="navbar-brand ">
                <i className="fa-solid fa-user me-2"></i>
                <span>{localStorage.getItem('nombre')}</span>
            </span>

            <button
                className="btn btn-outline-danger ms-2 "
                onClick={handleLogout}
            >
                <i className="fas fa-sign-out-alt"></i>
                &nbsp;
                <span>Salir</span>
            </button>
        </nav>
    );
};

