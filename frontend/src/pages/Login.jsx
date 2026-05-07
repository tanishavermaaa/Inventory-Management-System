// Login.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

export default function Login() {

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      setError("");

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-left">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Login
          </button>

        </form>
      </div>

      <div className="auth-right">

        <h2>Hello Friend!</h2>

        <p>Don't have an account?</p>

        <Link to="/register">
          <button className="login-btn">
            Sign Up
          </button>
        </Link>

      </div>

    </div>
  );
}