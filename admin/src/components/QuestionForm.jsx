import React, { useState } from "react";

export default function QuestionForm({ onAddQuestion, onUpdateQuestion, onCheckQuestion }) {
  const [question, setQuestion] = useState({
    year: 1,
    correct_code: "",
    incorrect_code: "",
    test_cases: [{ input: "", expectedOutput: "" }],
    id: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (idx, field, value) => {
    setQuestion((prev) => {
      const test_cases = [...prev.test_cases];
      test_cases[idx][field] = value;
      return { ...prev, test_cases };
    });
  };

  const handleAddTestCase = () => {
    setQuestion((prev) => ({ ...prev, test_cases: [...prev.test_cases, { input: "", expectedOutput: "" }] }));
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    onAddQuestion({
      year: Number(question.year),
      correct_code: question.correct_code,
      incorrect_code: question.incorrect_code,
      test_cases: question.test_cases.filter(tc => tc.input && tc.expectedOutput)
    });
    setQuestion({ year: 1, correct_code: "", incorrect_code: "", test_cases: [{ input: "", expectedOutput: "" }], id: "" });
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!question.id) return;
    onUpdateQuestion(question.id, {
      year: Number(question.year),
      correct_code: question.correct_code,
      incorrect_code: question.incorrect_code,
      test_cases: question.test_cases.filter(tc => tc.input && tc.expectedOutput)
    });
  };

  const handleSubmitCheck = (e) => {
    e.preventDefault();
    if (!question.id) return;
    onCheckQuestion(question.id);
  };

  return (
    <div className="question-form">
      <form onSubmit={handleSubmitAdd}>
        <h4>Add Question</h4>
        <input name="year" type="number" min="1" value={question.year} onChange={handleChange} placeholder="Year" required />
        <textarea name="correct_code" value={question.correct_code} onChange={handleChange} placeholder="Correct Code" required />
        <textarea name="incorrect_code" value={question.incorrect_code} onChange={handleChange} placeholder="Incorrect Code" required />
        <div>
          <label>Test Cases:</label>
          {question.test_cases.map((tc, idx) => (
            <div key={idx}>
              <input value={tc.input} onChange={e => handleTestCaseChange(idx, "input", e.target.value)} placeholder="Input" />
              <input value={tc.expectedOutput} onChange={e => handleTestCaseChange(idx, "expectedOutput", e.target.value)} placeholder="Expected Output" />
            </div>
          ))}
          <button type="button" onClick={handleAddTestCase}>+</button>
        </div>
        <button type="submit">Add Question</button>
      </form>
      <form onSubmit={handleSubmitUpdate}>
        <h4>Update Question</h4>
        <input name="id" value={question.id} onChange={handleChange} placeholder="Question ID" required />
        <input name="year" type="number" min="1" value={question.year} onChange={handleChange} placeholder="Year" required />
        <textarea name="correct_code" value={question.correct_code} onChange={handleChange} placeholder="Correct Code" required />
        <textarea name="incorrect_code" value={question.incorrect_code} onChange={handleChange} placeholder="Incorrect Code" required />
        <div>
          <label>Test Cases:</label>
          {question.test_cases.map((tc, idx) => (
            <div key={idx}>
              <input value={tc.input} onChange={e => handleTestCaseChange(idx, "input", e.target.value)} placeholder="Input" />
              <input value={tc.expectedOutput} onChange={e => handleTestCaseChange(idx, "expectedOutput", e.target.value)} placeholder="Expected Output" />
            </div>
          ))}
          <button type="button" onClick={handleAddTestCase}>+</button>
        </div>
        <button type="submit">Update Question</button>
      </form>
      <form onSubmit={handleSubmitCheck}>
        <h4>Check Question</h4>
        <input name="id" value={question.id} onChange={handleChange} placeholder="Question ID" required />
        <button type="submit">Check</button>
      </form>
    </div>
  );
}
