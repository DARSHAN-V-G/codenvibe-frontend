import "./Leaderboard.css";

export default function Leaderboard() {
  const data = [
    { id: 1, name: "CodeNinja42", score: 2847, solved: 12 },
    { id: 2, name: "DebugQueen", score: 2691, solved: 11 },
    { id: 3, name: "SyntaxSlayer", score: 2543, solved: 10 },
    { id: 4, name: "AlgoWizard", score: 2398, solved: 9 },
    { id: 5, name: "BitLord", score: 2231, solved: 8 },
  ];

  const getMedal = (rank: number): string | number => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="leaderboard-container">

      {/* Title with Trophy */}
      <div className="title-container">
        <h1 className="title"> Leaderboard</h1>
      </div>
      <p className="caption">Top debuggers in the competition</p>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Score</th>
            <th>Solved</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.id} className={i < 3 ? "highlight" : ""}>
              <td>{getMedal(i + 1)}</td>
              <td>{p.name}</td>
              <td className="score">{p.score}</td>
              <td>
                <span className="solved-pill">{p.solved}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
