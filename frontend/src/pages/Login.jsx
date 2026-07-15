import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
  email,
  password,
});

if (!response.data.success) {
  alert(response.data.message);
  return;
}

localStorage.setItem("user_id", response.data.user_id);



navigate("/home");

    } catch (error) {
  console.log(error);

  if (error.response) {
    alert(
      "Status: " +
      error.response.status +
      "\n\n" +
      JSON.stringify(error.response.data)
    );
  } else {
    alert(error.message);
  }
}
  };

  return (
  <div
  className="login-page"
  style={{
    backgroundImage: `url(${backgroundImage})`,
  }}
>
  <div className="overlay">
  
    <div className="login-content">
      <div className="login-header">

  <h1 className="brand-title">
    🏦 FinRelief AI
</h1>

  <h3>Welcome Back 👋</h3>

  <p>
    AI Powered Debt Relief & Financial Recovery Platform
  </p>

</div>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />


      <div className="password-box">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <span
    className="eye-icon"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

<button onClick={handleLogin}>
  Login
</button>
<p
  style={{
    marginTop: "12px",
    marginBottom: "18px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "38px",
    textDecoration: "underline",
  }}
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password?
</p>
      

<p className="register-text">
  Don't have an account?
</p>

<button
  className="register-btn"
  onClick={() => navigate("/register")}
>
  Create Account
</button>
    </div>
    </div>
    </div>
  );
}

export default Login;