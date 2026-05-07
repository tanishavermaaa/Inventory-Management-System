// Register.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      setSuccess("Registered Successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h2>Create Account</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              value={form.name}
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

          <div className="checkbox">
            <input type="checkbox" required />
            <span>I accept the terms of the agreement</span>
          </div>

          <button type="submit" className="signup-btn">
            Sign up
          </button>
        </form>
      </div>

      <div className="auth-right">
        <h2>Welcome Back!</h2>

        <p>Already have an account?</p>

        <Link to="/login">
          <button className="login-btn">Log in</button>
        </Link>
      </div>
    </div>
  );
}