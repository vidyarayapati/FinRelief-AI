import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background2.png";
import "./login.css";

function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    api.get(`/history/${user_id}`)
      .then((res) => {
        setHistory(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

            <h2 style={{ color: "white" }}>
              Financial History
            </h2>

          </div>

          {history.length === 0 ? (
            <p style={{ color: "white" }}>
              No history found.
            </p>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                style={{ marginBottom: "15px" }}
                onClick={() => navigate(`/dashboard/${item.id}`)}
              >
                {new Date(item.created_at).toLocaleDateString()}
              </button>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default History;