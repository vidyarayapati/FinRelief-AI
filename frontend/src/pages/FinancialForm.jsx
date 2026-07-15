import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/background2.png";
import "./login.css";

function FinancialForm() {
  const [debt, setDebt] = useState("");
  const [income, setIncome] = useState("");

  const [emi, setEmi] = useState("");
  const [interestRate, setInterestRate] = useState("");
const [overdueMonths, setOverdueMonths] = useState("");
const [paidEmiMonths, setPaidEmiMonths] = useState("");
  const navigate = useNavigate();
  const totalDebt = Number(debt);
const monthlyEMI = Number(emi);

const fullMonths =
  monthlyEMI > 0 ? Math.floor(totalDebt / monthlyEMI) : 0;

const remainder =
  monthlyEMI > 0 ? totalDebt % monthlyEMI : 0;

const totalEmiMonths =
  remainder === 0 ? fullMonths : fullMonths + 1;

const remainingEmiMonths =
  totalEmiMonths - Number(paidEmiMonths);
  const saveDetails = async () => {
    if (
  !debt ||
  !income ||
  !emi ||
  !overdueMonths ||
  !paidEmiMonths
) {
  alert("Please fill in all fields.");
  return;
}
  try {
    const userId = localStorage.getItem("user_id");

   await axios.post("https://finrelief-ai-1-ffz7.onrender.com/financial-details", {
  user_id: Number(userId),
  total_debt: Number(debt),
  income: Number(income),
  emi: Number(emi),
  interest_rate: Number(interestRate),
  overdue_months: Number(overdueMonths),
  total_emi_months: totalEmiMonths,
paid_emi_months: Number(paidEmiMonths),
remaining_emi_months: remainingEmiMonths,
});

    

    navigate("/dashboard");
  } catch (error) {
    console.log(error);
    alert("Failed to save details.");
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
      <div
  style={{
    background: "#ffffff",
    width: "1400px",
    padding: "45px 50px",
    borderRadius: "20px",

    boxShadow: "0 20px 45px rgba(0,0,0,0.25)",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }}
>
  <h1
  style={{
    color: "#2563EB",
    fontSize: "100px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "8px",
  }}
>
  🏦 FinRelief AI
</h1>

<h2
  style={{
    fontSize: "60px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "12px",
    color: "#111827",
  }}
>
  Add Financial Details
</h2>

<p
  style={{
    color: "#0d0e10",
    fontSize: "35px",
    textAlign: "center",
    lineHeight: "28px",
    marginBottom: "30px",
  }}
>
  Enter your financial information for AI-powered analysis.
</p>

      <br /><br />
<input
  type="number"
  placeholder="Total Debt (₹)"
  value={debt}
  onChange={(e) => setDebt(e.target.value)}
  style={inputStyle}
/>
<br /><br />

<input
  type="number"
  placeholder="Monthly EMI"
  value={emi}
  onChange={(e) => setEmi(e.target.value)}
  style={inputStyle}
/>

<br /><br />

<input
  type="number"
  placeholder="Interest Rate (%) (Optional)"
  value={interestRate}
  onChange={(e) => setInterestRate(e.target.value)}
  style={inputStyle}
/>

<br /><br />

<input
  type="number"
  placeholder="Overdue Months"
  value={overdueMonths}
  onChange={(e) => setOverdueMonths(e.target.value)}
  style={inputStyle}
/>

<br /><br />
<input
  type="number"
  placeholder="EMIs Already Paid"
  value={paidEmiMonths}
  onChange={(e) => setPaidEmiMonths(e.target.value)}
  style={inputStyle}
/>


      <br /><br />

      <input
        type="number"
        placeholder="Monthly Income"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        style={inputStyle}
      />

      <br /><br />

      <button
  onClick={() => {
    console.log("Button clicked");
    saveDetails();
  }}
  style={{
    width: "100%",
    padding: "14px",
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "35px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  }}
>
  Save Financial Details
</button>
</div>
     </div>
    </div>
    </div>
  );
}
const inputStyle = {
  width: "520px",
  height: "65px",

  padding: "0 20px",

  fontSize: "35px",

  border: "none",
  borderRadius: "10px",

  outline: "none",
  boxSizing: "border-box",

  display: "block",
  margin: "10px auto",

  background: "#e9e2e2",
};

export default FinancialForm;