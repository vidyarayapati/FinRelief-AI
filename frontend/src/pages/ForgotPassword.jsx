import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");

  const resetPassword = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    alert("Enter a valid email.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await axios.post(
      "https://finrelief-ai-1-ffz7.onrender.com/reset-password",
      {
        email,
        password,
      }
    );

    if (!res.data.success) {
      alert(res.data.message);
      return;
    }

    alert("Password updated successfully!");
    navigate("/");
  } catch (err) {
    console.log(err);
    alert("Unable to reset password.");
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

  <h3>Reset Password</h3>

  <p>
    Reset your account password securely.
  </p>

</div>

      <input
  type="email"
  placeholder="Enter Email"
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
  placeholder="Enter New Password"
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

<div className="password-box">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />

  <span
    className="eye-icon"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
  >
    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

      <button onClick={resetPassword}>
  Save Password
</button>
<p className="register-text">
  remembered password?
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

export default ForgotPassword;