import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import ReportPDF from "../components/ReportPDF";
import html2pdf from "html2pdf.js";


import backgroundImage from "../assets/background2.png";
import "./Login.css";
import "./Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();
  const { historyId } = useParams();
  const userId = localStorage.getItem("user_id");

  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [settlementAdvice, setSettlementAdvice] = useState("");
  const [negotiationLetter, setNegotiationLetter] = useState("");
  const latestNegotiationLetter = useRef("");

const [showLetter, setShowLetter] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [aiAdvice, setAiAdvice] = useState("");
  const totalDebt = data?.total_debt || 0;
const monthlyEMI = data?.emi || 0;

const fullMonths =
  monthlyEMI > 0 ? Math.floor(totalDebt / monthlyEMI) : 0;

const remainder =
  monthlyEMI > 0 ? totalDebt % monthlyEMI : 0;

const totalMonths =
  remainder === 0 ? fullMonths : fullMonths + 1;
  useEffect(() => {
  if (data?.score) {
    let start = 0;
    const end = data.score;

    const interval = setInterval(() => {
      start += 2;

      if (start >= end) {
        start = end;
        clearInterval(interval);
      }

      setAnimatedScore(start);
    }, 20);
  }
}, [data]);
  

  useEffect(() => {
  if (!userId) {
    navigate("/");
    return;
  }

  const url = historyId
    ? "http://127.0.0.1:8000/history-details/" + historyId
    : "http://127.0.0.1:8000/dashboard/" + userId;

  axios
    .get(url)
    .then((res) => setData(res.data))
    .catch((err) => console.log(err));

}, [userId, historyId, navigate]);

  const downloadPDF = async () => {
  try {
    console.log("Negotiation Letter:", latestNegotiationLetter.current);
    const res = await axios.post(
      "http://127.0.0.1:8000/download-report",
      {
        user_id: Number(userId),
        history_id: historyId ? Number(historyId) : null,
        recommendation: aiAdvice,
        negotiation_letter: latestNegotiationLetter.current,
      },
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");
    link.href = url;
    link.download = `FinRelief_Report_${userId}.pdf`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.log(err);
    alert("Unable to download report.");
  }
};
  const handleLogout = () => {
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const sendMessage = async () => {
    const res = await axios.post("http://127.0.0.1:8000/chat", {
      user_id: Number(userId),
      question: message,
    });
    setReply(res.data.reply);
  };

  const getSettlementAdvice = async () => {
  try {
   const res = await axios.post(
  "http://127.0.0.1:8000/settlement-advice",
  {
    user_id: Number(userId),
    history_id: historyId ? Number(historyId) : null,
  }
);

    const text = res.data.recommendation;

    const cleaned = text
      .split("\n")
      .map(line => line.replace(/[*•-]/g, "").trim())
      .filter(line => line !== "")
      .slice(0, 5)
      .join("\n");

    setAiAdvice(cleaned);

  } catch (error) {
    console.log(error);
    alert("AI recommendation failed");
  }
};


    const getNegotiationLetter = async () => {
  try {

    const res = await axios.post(
      "http://127.0.0.1:8000/negotiation-letter",
      {
        user_id: Number(userId),
        history_id: historyId ? Number(historyId) : null,
      }
    );


    console.log("Letter Response:", res.data);


    latestNegotiationLetter.current = res.data.letter;

setNegotiationLetter(res.data.letter);


    alert("Negotiation Letter Generated Successfully!");
    const pdfRes = await axios.get(
  "http://127.0.0.1:8000/download-negotiation-letter",
  {
    responseType: "blob",
  }
);

const url = window.URL.createObjectURL(
  new Blob([pdfRes.data])
);

const link = document.createElement("a");

link.href = url;

link.download = `Negotiation_Letter_${userId}.pdf`;

document.body.appendChild(link);

link.click();

link.remove();

window.URL.revokeObjectURL(url);


  } catch (err) {

    console.log(err);

    alert("Unable to generate letter.");

  }
};

 const chartData = {
  labels: ["Total Debt", "Monthly Income"],
  datasets: [
    {
      label: "Amount (₹)",
      data: data ? [data.total_debt, data.income] : [0, 0],

      backgroundColor: [
        "#3B82F6", // Blue
        "#10B981", // Green
      ],

      borderColor: [
        "#2563EB",
        "#059669",
      ],

      borderWidth: 2,
      borderRadius: 10,
      barThickness: 120,
maxBarThickness: 140,
categoryPercentage: 0.8,
barPercentage: 0.9,
    },
  ],
};

  return (
    <div
       className="login-page"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      minHeight: "100vh",
    }}
  >
    <div
  className="overlay"
  style={{
    backdropFilter: "blur(12px)",
    background: "rgba(0,0,0,0.35)",
  }}
>

      <div
        style={{
  width: "100%",
  maxWidth: "1650px",
  padding: "40px",
  margin: "0 auto",
}}
      >
    <div
      style={{
        width: "100%",
        maxWidth: "1550px",
        display: "flex",
        flexDirection: "column",
        gap: "35px",
      }}
    >
      {/* REPORT WRAPPER START */}
      <div
  id="pdf-report"
  style={{
  width: "100%",
  maxWidth: "1700px",
  margin: "40px auto",
  padding: "45px",

  background: "transparent",
  backdropFilter: "none",

  border: "none",
  borderRadius: "28px",

  boxShadow: "none",
}}
>
        <div style={{ height: "30px" }}></div>
        <div
  style={{
    textAlign: "center",
    marginBottom: "35px",
  }}
>
  <h1
    style={{
      color: "#fff",
      fontSize: "80px",
      marginBottom: "10px",
    }}
  >
    📊 Your Dashboard
  </h1>

  <p
    style={{
      color: "#e5e7eb",
      fontSize: "30px",
    }}
  >
    Welcome to <b>FinRelief AI</b>
  </p>
</div>
        {/* DASHBOARD DATA */}
        {data ? (
          <div
  style={{
  display: "grid",

  gridTemplateColumns: "repeat(4, minmax(280px, 320px))",

  columnGap: "170px",

  rowGap: "170px",
  justifyContent: "center",

  marginTop: "40px",

  width: "100%",
}}
>
            

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>💰 Total Debt</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>₹{data?.total_debt}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>💵 Income</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>₹{data?.income}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>🤖 AI Status</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>{data?.status}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>💳 EMI</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>₹{data?.emi}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>📅 Overdue</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>{data?.overdue_months}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>📆 Total EMI Months</h3>
              <h2 style={{ color: "#fff",
    fontSize: "40px",
    fontWeight: "700",
     }}>{data?.total_emi_months}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>✅ EMIs Paid</h3>
              <h2 style={{ color: "#fff" ,
    fontSize: "40px",
    fontWeight: "700",
    }}>{data?.paid_emi_months}</h2>
            </div>

            <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
              <h3 style={{ color: "#fff",
    fontSize: "24px",
    marginBottom: "20px",
    }}>⏳ Remaining EMI Months</h3>
              <h2 style={{ color: "#fff" ,
    fontSize: "40px",
    fontWeight: "700",
    }}>{data?.remaining_emi_months}</h2>
            </div>
            

            


          </div>
       ) : (
  <p
    style={{
      color: "white",
      textAlign: "center",
      fontSize: "20px",
      marginTop: "30px",
    }}
  >
    Loading data...
  </p>
)}
       

        {/* CHART */}
        <div
  style={{
    width: "100%",
    maxWidth: "1200px",
    height: "600px",
    margin: "70px auto",
    background: "#ffffff",   // White background
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  }}
>
  <h2
  style={{
    textAlign: "center",
    fontSize: "36px",
    fontWeight: "700",
    color: "#1E3A8A",
    marginTop: "-25px",
    marginBottom: "20px",
  }}
>
  📊 Financial Health Overview
</h2>
          <Bar
  data={chartData}
  options={{
    responsive: true,
    plugins: {
  legend: {
    display: false,
  },

  tooltip: {
    backgroundColor: "#222",
    titleColor: "#fff",
    bodyColor: "#fff",

    titleFont: {
      size: 24,
      weight: "bold",
    },

    bodyFont: {
      size: 22,
      weight: "bold",
    },

    padding: 22,

    displayColors: true,

    boxWidth: 22,
    boxHeight: 22,

    cornerRadius: 10,
  },
},
    scales: {
      x: {
  ticks: {
    color: "#000",
    font: {
      size: 22,      // Increase text size
      weight: "bold",
    },
    padding: 15,     // Space between labels and chart
  },
  grid: {
    display: false,
  },
},
      y: {
  ticks: {
    display: false,   // Hides Y-axis values
  },
  grid: {
    display: false,   // Hides horizontal grid lines
  },
  border: {
    display: false,
  },
},
    },
  }}
/>
        </div>

        {/* BUTTONS */}
        {/* AI Recommendation Button */}

<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50px",
    marginBottom: "30px",
  }}
>

  <button
     onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
  }}
    style={buttonStyle}
    onClick={getSettlementAdvice}
  >
    🤖 Get AI Settlement Recommendation
  </button>

</div>

{/* Recommendation Box */}

<div
  style={{
    marginTop: "25px",
    padding: "20px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    color: "white",
    textAlign: "center",
  }}
>
  <h3 style={{
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "20px",
    textAlign: "center",
  }}
  >🤖 AI Recommendation</h3>

  {aiAdvice ? (
    aiAdvice.split("\n").map((line, i) => (
      <p
  key={i}
  style={{
    fontSize: "24px",
    lineHeight: "1.8",
    textAlign: "center",
    marginBottom: "10px",
  }}
>
  ✔ {line}
</p>
    ))
  ) : (
    <p  style={{
    fontSize: "24px",
    lineHeight: "1.8",
    textAlign: "center",
  }}
  >Click the button above to generate recommendation.</p>
  )}
</div>

{/* Action Buttons */}

<div
  style={{
  display: "grid",
  gridTemplateColumns: "repeat(2, 500px)",

  justifyContent: "center",

  columnGap: "250px",
  rowGap: "100px",

  marginTop: "60px",
}}
>

  

  <button
    style={buttonStyle}
     onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
  }}
    onClick={getNegotiationLetter}
  >
    📄 Generate Letter
  </button>

  <button
    style={buttonStyle}
    onClick={downloadPDF}
     onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
  }}
  >
    📥 Download PDF Report
  </button>

  <button
  style={buttonStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
  }}
  onClick={() => navigate("/")}
>
  🚪 Logout
</button>

</div>
        {/* CHAT */}
        <h2 style={{
    fontSize: "60px",
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginTop: "70px",
    marginBottom: "25px",
  }}
  >Ask AI</h2>

        <input
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Ask anything about your finances..."
  style={{
    width: "100%",
    maxWidth: "800px",
    height: "100px",
    padding: "0 20px",
    fontSize: "28px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    display: "block",
    margin: "0 auto",
  }}
/>

        <button
  style={sendButtonStyle}
  onClick={sendMessage}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  📤 Send
</button>

        <div style={replyBox}>
  <h2
    style={{
      textAlign: "center",
      fontSize: "35px",
      marginBottom: "20px",
      color: "#1f4ed8",
      fontWeight: "bold",
    }}
  >
    🤖 AI Response
  </h2>
  <div style={{ textAlign: "center"}}>
  <div
  style={{
    fontSize: "30px",
    textAlign: "center",
    fontWeight: "500",
  }}
>
  <ReactMarkdown>
    {reply || "Click the Send button to generate an AI response."}
  </ReactMarkdown>
</div>
</div>
</div>

        {/* ADVICE */}
        
      
            </div> {/* REPORT CLOSE */}
      
  <div
    id="letter-pdf"
    style={{
      position: "absolute",
      left: "-9999px",
      background: "#fff",
      padding: "40px",
      width: "800px",
      color: "#000",
      fontFamily: "Times New Roman",
      lineHeight: "1.8",
    }}
  >
    <h1 style={{ textAlign: "center" }}>
      Debt Settlement Negotiation Letter
    </h1>

    <hr />

    <pre
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "Times New Roman",
        fontSize: "16px",
      }}
    >
      {negotiationLetter}
    </pre>
  </div>


      {/* Hidden Professional PDF */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <ReportPDF
          data={data}
          userId={userId}
          aiAdvice={aiAdvice}
          negotiationLetter={negotiationLetter}
        />
      </div>

                

      </div> {/* maxWidth:1200 */}

    </div> {/* maxWidth:1400 */}

  </div> {/* overlay */}

</div>     

  );
}

/* STYLES */
const cardStyle = {
  background: "rgba(255,255,255,0.10)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "25px",

  minHeight: "280px",
 width: "100%",

  padding: "45px",

  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",

  textAlign: "center",

  color: "#fff",

  transition: "0.3s ease",

  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
};

const buttonStyle = {
  width: "500px",
  height: "95px",

  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "#fff",

  border: "none",
  borderRadius: "16px",

  fontSize: "28px",
  fontWeight: "700",

  cursor: "pointer",

  boxShadow: "0 10px 25px rgba(37,99,235,0.45)",

  transition: "all 0.3s ease",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  gap: "12px",
};

const sendButtonStyle = {
  width: "300px",
  height: "80px",

  background: "linear-gradient(135deg, #10b981, #059669)",

  color: "#fff",

  border: "none",
  borderRadius: "14px",

  fontSize: "24px",
  fontWeight: "700",

  cursor: "pointer",

  margin: "25px auto",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  boxShadow: "0 8px 20px rgba(16,185,129,0.35)",
};

const progressBar = {
  width: "100%",
  height: "12px",
  backgroundColor: "#ddd",
  borderRadius: "10px",
  marginTop: "10px",
  overflow: "hidden",
};

const replyBox = {
  width: "100%",
  maxWidth: "1400px",   // Width increase

  minHeight: "100px",   // Height increase

  margin: "30px auto",  // Center

  padding: "30px",

  border: "1px solid #ccc",
  borderRadius: "18px",

  background: "rgba(255,255,255,0.95)",

  fontSize: "24px",     // Text size increase
  lineHeight: "1.8",
  textAlign: "center",

  overflowY: "auto",
};

const adviceBox = {
  marginTop: "20px",
  padding: "20px",
  border: "2px solid #4CAF50",
  borderRadius: "10px",
  backgroundColor: "#f1fff1",
};

const letterBox = {
  marginTop: "20px",
  padding: "20px",
  border: "2px solid #2196F3",
  borderRadius: "10px",
  backgroundColor: "#f4f9ff",
};

export default Dashboard;
