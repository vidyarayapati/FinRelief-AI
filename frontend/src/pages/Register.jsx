import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");

  const registerUser = async () => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  setEmailError("Please enter a valid email address.");
  return;
}

setEmailError("");
const passwordRegex =
  /^(?=(?:.*\d){3,})(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;

if (!passwordRegex.test(password)) {
  setPasswordError(
    "Password must contain at least 9 characters, 1 uppercase letter, 3 numbers and 1 special character."
  );
  return;
}

setPasswordError("");
      const res = await axios.post("http://127.0.0.1:8000/register", {
        email,
        password,
      });

      if (res.data.message === "Email already registered") {
  alert("Email already registered!");
  return;
}

alert("Account created successfully!");
navigate("/");
    } catch (err) {
      alert("Registration failed");
      console.log(err);
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

  <h3>Create Account</h3>

  <p>
    Join FinRelief AI and start your financial recovery journey.
  </p>

</div>

      <input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "" || emailRegex.test(value)) {
      setEmailError("");
    } else {
      setEmailError("Please enter a valid email address.");
    }
  }}
/>
{emailError && (
  <p
    style={{
      color: "#ff4d4f",
      fontSize: "25px",
      marginTop: "5px",
      marginBottom: "10px",
      width: "520px",
      textAlign: "left",
    }}
  >
    ❌ {emailError}
  </p>
)}

      <div className="password-box">
  <input
  type={showPassword ? "text" : "password"}
  placeholder="Create Password"
  value={password}
  onChange={(e) => {
    const value = e.target.value;
    setPassword(value);

    const passwordRegex =
      /^(?=(?:.*\d){3,})(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{9,}$/;

    if (value === "" || passwordRegex.test(value)) {
      setPasswordError("");
    } else {
      setPasswordError(
        "Password must contain at least 9 characters, 1 uppercase letter, 3 numbers and 1 special character."
      );
    }
  }}
/>

  <span
    className="eye-icon"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

{passwordError && (
  <p
    style={{
      color: "red",
      fontSize: "25px",
      width: "520px",
      textAlign: "left",
      marginBottom: "10px",
    }}
  >
    ❌ {passwordError}
  </p>
)}

      <button onClick={registerUser}>
  Create Account
</button>
<p className="register-text">
  Already have an account?
</p>

<button
  className="register-btn"
  onClick={() => navigate("/")}
>
  Login
</button>
    </div>
    </div>
    </div>
  );
}

export default Register;