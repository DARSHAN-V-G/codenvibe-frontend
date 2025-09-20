import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface CodeEditorPageProps {
  questionId: number;
  onBack: () => void;
}

const currentUserRank = 7;

type TestResult = { passed: boolean; input: string; expected: string; actual: string };
type Submission = { timestamp: string; durationMs: number; passed: number; total: number; results: TestResult[] };

const mockProblems: Record<number, {
  title: string;
  description: string;
  sampleInput: string;
  expectedOutput: string;
  initialCode: string;
}> = {
  1: {
    title: 'Array Index Bug',
    description: `You are given a function that should return the sum of all elements in an array. However, there's a bug in the implementation that causes an index out of bounds error.

**Problem:** The function crashes when processing arrays.

**Sample Input:** [1, 2, 3, 4, 5]
**Expected Output:** 15

**Your Task:** Fix the bug in the code so it correctly calculates the sum.`,
    sampleInput: '[1, 2, 3, 4, 5]',
    expectedOutput: '15',
    initialCode: `def sum_array(arr):
    total = 0
    for i in range(len(arr) + 1):  # Bug: should be len(arr)
        total += arr[i]
    return total


# Test the function
print(sum_array([1, 2, 3, 4, 5]))



`
  },
  2: {
    title: 'Loop Logic Error',
    description: `This function should find the maximum number in a list, but it has a logical error that prevents it from working correctly.

**Problem:** The function returns incorrect results.

**Sample Input:** [3, 7, 2, 9, 1]
**Expected Output:** 9

**Your Task:** Fix the logic error to correctly find the maximum value.`,
    sampleInput: '[3, 7, 2, 9, 1]',
    expectedOutput: '9',
    initialCode: `def find_max(numbers):
    max_num = 0  # Bug: should be numbers[0] or float('-inf')
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num


# Test the function
print(find_max([3, 7, 2, 9, 1]))



`
  }
};

export function CodeEditorPage({ questionId, onBack }: CodeEditorPageProps) {
  const problem = mockProblems[questionId] || mockProblems[1];

  const [code, setCode] = useState<string>(problem.initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'submissions'>('code');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const handleRunCode = () => {
    if (!code.trim()) {
      alert('Please write some code before running!');
      return;
    }

    setIsRunning(true);
    setActiveTab('code');
    setShowOutput(true);
    setOutput('> Running Python code...\n> Initializing interpreter...\n> Please wait...');

    setTimeout(() => {
      try {
        const mockOutput = `> Running Python code...
> Executing: ${problem.title}
> Input: ${problem.sampleInput}
> Expected Output: ${problem.expectedOutput}
> Your Output: 15
> ✅ Code executed successfully!
> Execution time: 0.234s`;
        setOutput(mockOutput);
      } catch (err) {
        setOutput(`> ❌ Runtime Error: ${String(err)}\n> Please check your code and try again.`);
      } finally {
        setIsRunning(false);
      }
    }, 1200);
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    setIsSubmitting(true);
    setActiveTab('submissions');
    setShowOutput(false);

    const startedAt = Date.now();
    setTimeout(() => {
      // Mock results
      const results: TestResult[] = [
        { passed: true, input: '[1, 2, 3, 4, 5]', expected: '15', actual: '15' },
        { passed: true, input: '[10, 20, 30]', expected: '60', actual: '60' },
        { passed: true, input: '[]', expected: '0', actual: '0' },
        { passed: true, input: '[42]', expected: '42', actual: '42' },
        { passed: true, input: '[-1, -2, -3]', expected: '-6', actual: '-6' }
      ];

      const durationMs = Date.now() - startedAt;
      const newSubmission: Submission = {
        timestamp: new Date().toLocaleString(),
        durationMs,
        passed: results.filter(r => r.passed).length,
        total: results.length,
        results
      };
      setSubmissions(prev => [newSubmission, ...prev]);

      setIsSubmitting(false);
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button
            onClick={onBack}
            className="py-2 px-4 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
            ← Back to Challenges
          </Button>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Patrick Hand, cursive' }}>
            {problem.title}
          </h1>
          <div
            className="border-2 border-black text-black px-4 py-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Rank #{currentUserRank}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Statement */}
        <div className="w-2/5 border-r-2 border-black p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Patrick Hand, cursive' }}>
            Problem Statement
          </h2>
          <div className="prose max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">{problem.description}</div>
          </div>
        </div>

        {/* Right Panel - Tabs: Code | Submissions */}
        <div className="w-3/5 flex flex-col">
          <div className="p-6 pb-0">
            <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'code' | 'submissions')}>
              <TabsList className="border-2 border-black rounded-lg bg-white">
                <TabsTrigger
                  value="code"
                  className="px-4 py-2 rounded-md border-2 border-transparent flex items-center gap-2 transition-colors data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M9 8l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="px-4 py-2 rounded-md border-2 border-transparent flex items-center gap-2 transition-colors data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Submissions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-4">
                <div className="p-2">
                  <Label className="text-lg font-bold mb-4 block" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                    Code Editor (Python)
                  </Label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 font-mono text-sm border-2 border-black rounded-lg p-6 mb-6"
                    placeholder="Write your Python code here..."
                    style={{
                      fontFamily: 'Monaco, Consolas, monospace',
                      backgroundColor: '#2f2f2f',
                      color: '#f5f5f5',
                      caretColor: '#ffffff',
                      lineHeight: '1.6'
                    }}
                  />

                  {showOutput && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-lg font-bold" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                          Output Console
                        </Label>
                        <Button onClick={() => setShowOutput(false)} className="text-xs px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                          ✕ Close
                        </Button>
                      </div>
                      <div className="w-full h-44 border-2 border-black rounded-lg p-4 font-mono text-sm overflow-y-auto" style={{ backgroundColor: '#2f2f2f', color: '#f5f5f5' }}>
                        <pre className="whitespace-pre-wrap text-green-400">{output || '> Ready to run your code...'}</pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-6">
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="flex-1 py-4 px-8 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                      style={{ fontFamily: 'Patrick Hand, cursive' }}
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isRunning}
                      className="flex-1 py-4 px-8 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                      style={{ fontFamily: 'Patrick Hand, cursive' }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="mt-4">
                <div className="p-6 space-y-4">
                  {isSubmitting && (
                    <div className="border-2 border-black rounded-lg p-4 bg-white" style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                      <pre className="whitespace-pre-wrap">{`> Submitting solution...\n> Running Python test cases...\n> Please wait...`}</pre>
                    </div>
                  )}

                  {!isSubmitting && submissions.length === 0 && (
                    <div className="text-gray-600" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                      No submissions yet. Click "Submit Solution" to run test cases.
                    </div>
                  )}

                  {!isSubmitting && submissions.length > 0 && (
                    <div className="space-y-3">
                      {submissions.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between border-2 border-black rounded-lg px-4 py-3 bg-white">
                          <div className="font-bold" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                            Result: {s.passed}/{s.total} test cases passed
                          </div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {s.timestamp} • {s.durationMs}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center gap-6 mt-4">
                    <Button onClick={() => setActiveTab('code')} className="py-2 px-4 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                      Back to Code
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="py-2 px-4 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                      Submit Again
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}