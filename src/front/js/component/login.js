import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Context } from "../store/appContext";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Assuming you have your actions in a context
  const { actions } = useContext(Context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let bool = await actions.login(email, password);
      console.log(bool);
      if (bool) {
        // Replace 'usuario' with the actual path you want to navigate to
        navigate("/user", { replace: true }); 
      }
    } catch (error) {
      // Handle error (e.g., show error message to user)
      console.error('Login failed:', error);
      setError('Login failed: ' + error.message);
    }
  };

  return (
    <>
      {localStorage.getItem("token") ? (
           <Navigate to="/user" replace />
      ) : (
        
        <div className="login-container">
          <div className="login-box">
            <div className="login-content">
              <h2 className="login-heading">Login</h2>
              {error && <p className="error">{error}</p>}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                  />
                </div>
                <button type="submit" className="btn btn-primary login-button">
                  Login
                </button>
              </form>
              <p className="register-link">
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
        )}         
          </>
        );
      };

export default Login;
