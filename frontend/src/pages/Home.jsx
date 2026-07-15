import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background2.png";
import "./login.css";

function Home() {
  const navigate = useNavigate();

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

            <h2
  style={{
    color: "white",
    fontSize: "65px",
    marginBottom: "40px",
  }}
>
  Welcome to FinRelief AI 👋
</h2>

<p
  style={{
    color: "#E5E7EB",
    fontSize: "30px",
    lineHeight: "40px",
    maxWidth: "800px",
    textAlign: "center",
    margin:"0 auto",
  }}
>
  Your intelligent financial companion designed to help you manage debt, improve financial
  wellness, and achieve long-term financial stability through AI-driven insights and
  personalized guidance.
</p>

          </div>

          
          

          <button
            className="register-btn"
            onClick={() => navigate("/financial-form")}
            style={{marginTop: "25px"}}
          >
            Add Financial Details
          </button>


<button
  className="register-btn"
  onClick={() => navigate("/history")}
  style={{marginTop: "50px"}}
>
  📜 History
</button>

        </div>

      </div>
    </div>
  );
}

export default Home;