import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1>Admin Portal</h1>
      <nav>
        <Link to="/teams" className="nav-link">Teams Management</Link>
        <Link to="/questions" className="nav-link">Questions Management</Link>
      </nav>
    </div>
  );
}
