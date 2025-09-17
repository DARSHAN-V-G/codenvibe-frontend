import React, { useEffect, useState } from "react";
import { getTeams, addTeam, removeTeam } from "../../api/api";
import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";
import "../styles/teams.css";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await getTeams();
      setTeams(res.teams || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch teams");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddTeam = async (team) => {
    try {
      await addTeam(team);
      fetchTeams();
    } catch (err) {
      setError(err.message || "Failed to add team");
    }
  };

  const handleRemoveTeam = async (teamName) => {
    try {
      await removeTeam({ team_name: teamName });
      fetchTeams();
    } catch (err) {
      setError(err.message || "Failed to remove team");
    }
  };

  return (
    <div className="teams-container">
      <h2>Teams Management</h2>
      <TeamForm onAddTeam={handleAddTeam} />
      {loading ? (
        <p>Loading teams...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <TeamList teams={teams} onRemoveTeam={handleRemoveTeam} />
      )}
    </div>
  );
}
