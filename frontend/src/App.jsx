import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FinancialForm from "./pages/FinancialForm";
import History from "./pages/History";
import HistoryDashboard from "./pages/HistoryDashboard";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

        <Route path="/home" element={<Home />} />

        <Route path="/history" element={<History />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
  path="/dashboard/:historyId"
  element={<Dashboard />}
/>

        <Route path="/financial-form" element={<FinancialForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;