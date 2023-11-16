import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home.css";

export const Home = () => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem("token") ? true : false;

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Bienvenido a Nuestra Aplicación</h1>
            </header>
            <section className="home-content">
                <p>Descubre todas las características y herramientas que ofrecemos.</p>
                {!isAuthenticated && (
                    <Link to="/login" className="btn btn-primary home-login-button">Iniciar Sesión</Link>
                )}
            </section>
        </div>
    );
};