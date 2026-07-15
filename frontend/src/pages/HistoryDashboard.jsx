import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function HistoryDashboard() {

    const { historyId } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    useEffect(() => {

        axios
            .get("https://finrelief-ai-1-ffz7.onrender.com/history-details/" + historyId)
            .then((res) => {

                setData(res.data);

            })
            .catch((err) => console.log(err));

    }, [historyId]);

    if (!data) {

        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

    }

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "40px"
            }}
        >

            <h1 style={{ textAlign: "center" }}>
                Financial History Report
            </h1>

            <br />

            <div
                style={{
                    maxWidth: "700px",
                    margin: "auto",
                    background: "white",
                    padding: "30px",
                    borderRadius: "15px"
                }}
            >

                <h2>Total Debt : ₹{data.total_debt}</h2>

                <h2>Income : ₹{data.income}</h2>

                <h2>EMI : ₹{data.emi}</h2>

                <h2>Overdue Months : {data.overdue_months}</h2>

                <h2>Total EMI Months : {data.total_emi_months}</h2>

                <h2>Paid EMI Months : {data.paid_emi_months}</h2>

                <h2>Remaining EMI Months : {data.remaining_emi_months}</h2>

                <br />

                <button onClick={() => navigate("/history")}>
                    Back
                </button>

            </div>

        </div>

    );

}

export default HistoryDashboard;