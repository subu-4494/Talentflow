import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav style={{ padding: "1rem", background: "#007bff", color: "#fff" }}>
      <NavLink
        to="/jobs"
        style={{ marginRight: "1rem", color: "#fff" }}
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Jobs
      </NavLink>
      <NavLink
        to="/candidates"
        style={{ marginRight: "1rem", color: "#fff" }}
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Candidates
      </NavLink>
      <NavLink
        to="/assessments/1"
        style={{ marginRight: "1rem", color: "#fff" }}
        className={({ isActive }) => (isActive ? "active-link" : "")}
      >
        Assessments
      </NavLink>
    </nav>
  );
}
