import React, { useState } from "react";
import { addQuestion, updateQuestion, checkQuestion } from "../../api/api";
import QuestionForm from "../components/QuestionForm";
import "../styles/questions.css";

export default function Questions() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAddQuestion = async (question) => {
    try {
      const res = await addQuestion(question);
      setResult(res);
      setError("");
    } catch (err) {
      setError(err.error || "Failed to add question");
    }
  };

  const handleUpdateQuestion = async (id, question) => {
    try {
      const res = await updateQuestion(id, question);
      setResult(res);
      setError("");
    } catch (err) {
      setError(err.error || "Failed to update question");
    }
  };

  const handleCheckQuestion = async (id) => {
    try {
      const res = await checkQuestion(id);
      setResult(res);
      setError("");
    } catch (err) {
      setError(err.error || "Failed to check question");
    }
  };

  return (
    <div className="questions-container">
      <h2>Questions Management</h2>
      <QuestionForm
        onAddQuestion={handleAddQuestion}
        onUpdateQuestion={handleUpdateQuestion}
        onCheckQuestion={handleCheckQuestion}
      />
      {error && <p className="error">{error}</p>}
      {result && (
        <pre className="result">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
