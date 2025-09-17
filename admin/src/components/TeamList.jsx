import React from "react";

export default function TeamList({ teams, onRemoveTeam }) {
  return (
    <div className="team-list">
      <h3>Teams</h3>
      <table>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Year</th>
            <th>Roll Numbers</th>
            <th>Emails</th>
            <th>Members</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, idx) => (
            <tr key={idx}>
              <td>{team.team_name}</td>
              <td>{team.year || "-"}</td>
              <td>{team.roll_nos?.join(", ")}</td>
              <td>{team.emails?.join(", ")}</td>
              <td>{team.members?.join(", ")}</td>
              <td>
                <button onClick={() => onRemoveTeam(team.team_name)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
