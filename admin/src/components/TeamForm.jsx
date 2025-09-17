import React, { useState } from "react";

export default function TeamForm({ onAddTeam }) {
  const [team, setTeam] = useState({
    team_name: "",
    roll_nos: [""],
    emails: [""],
    year: 1,
    members: [""]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, idx, value) => {
    setTeam((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddField = (field) => {
    setTeam((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTeam({
      ...team,
      roll_nos: team.roll_nos.filter(Boolean),
      emails: team.emails.filter(Boolean),
      members: team.members.filter(Boolean),
      year: Number(team.year)
    });
    setTeam({ team_name: "", roll_nos: [""], emails: [""], year: 1, members: [""] });
  };

  return (
    <form className="team-form" onSubmit={handleSubmit}>
      <input name="team_name" value={team.team_name} onChange={handleChange} placeholder="Team Name" required />
      <input name="year" type="number" min="1" value={team.year} onChange={handleChange} placeholder="Year" required />
      <div>
        <label>Roll Numbers:</label>
        {team.roll_nos.map((roll, idx) => (
          <input key={idx} value={roll} onChange={e => handleArrayChange("roll_nos", idx, e.target.value)} placeholder="Roll No" />
        ))}
        <button type="button" onClick={() => handleAddField("roll_nos")}>+</button>
      </div>
      <div>
        <label>Emails:</label>
        {team.emails.map((email, idx) => (
          <input key={idx} value={email} onChange={e => handleArrayChange("emails", idx, e.target.value)} placeholder="Email" />
        ))}
        <button type="button" onClick={() => handleAddField("emails")}>+</button>
      </div>
      <div>
        <label>Members:</label>
        {team.members.map((member, idx) => (
          <input key={idx} value={member} onChange={e => handleArrayChange("members", idx, e.target.value)} placeholder="Member Name" />
        ))}
        <button type="button" onClick={() => handleAddField("members")}>+</button>
      </div>
      <button type="submit">Add Team</button>
    </form>
  );
}
