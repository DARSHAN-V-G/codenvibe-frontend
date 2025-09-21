import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { questionApi, submissionApi, Question, checkAuthCookie } from '../api';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface CodeEditorPageProps {
  questionId: string;  // Changed from number to string to match backend _id
  onBack: () => void;
}

// Get current user's rank from leaderboard data
const getCurrentUserRank = (leaderboardData: any[]) => {
  const teamName = JSON.parse(localStorage.getItem('team') || '{}').team_name;
  if (!teamName || !leaderboardData?.length) return null;
  
  const teamEntry = leaderboardData.find(entry => entry.team_name === teamName);
  return teamEntry?.rank || null;
};



export function CodeEditorPage({ questionId, onBack }: CodeEditorPageProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [runResults, setRunResults] = useState<{
    title: string;
    passedCount: number;
    totalTests: number;
    newScore: number;
    visibleResults: Array<{
      passed: boolean;
      input: string;
      expectedOutput: string;
      actualOutput: string;
      error?: string;
    }>;
    hiddenCount: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'submissions'>('code');
  const [error, setError] = useState<string | null>(null);
  const [rawQuestionData, setRawQuestionData] = useState<any>(null); // For debugging
  const [monacoError, setMonacoError] = useState<boolean>(false);
  const [submissionLogs, setSubmissionLogs] = useState<Array<{
    _id: string;
    submissionid: string;
    status: 'accepted' | 'wrong submission';
    created_at: string;
  }>>([]);
  const [questionViewedAt, setQuestionViewedAt] = useState<string | null>(null);
  const { leaderboardData } = useWebSocket();
  const currentUserRank = getCurrentUserRank(leaderboardData);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message.includes('monaco') || error.message.includes('vs/loader')) {
        console.error('❌ Monaco Editor failed to load:', error);
        setMonacoError(true);
        toast.error('Code editor failed to load, using fallback editor');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  const runDiagnostics = async () => {
    
    // Check authentication cookie
    const cookieStatus = checkAuthCookie();
    
    // Check localStorage
    const storedTeam = localStorage.getItem('team');

    try {

      const response = await fetch((import.meta as any).env.VITE_BACKEND_URL + '/question/getQuestion', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

    } catch (fetchError) {
      console.error('Direct fetch failed:', fetchError);
    }
  };


  useEffect(() => {
    runDiagnostics();
  }, []);


  useEffect(() => {
    if (activeTab === 'submissions' && questionId) {
      fetchSubmissionLogs();
    }
  }, [activeTab, questionId]);


  const retryFetchQuestion = async () => {
    if (!questionId) {
      toast.error('No question ID available to retry');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
  
      const questionData = await questionApi.getQuestionById(questionId);
      
      setQuestion(questionData);
      setCode(questionData.incorrect_code || '# Write your code here\n');
      toast.success('Question loaded successfully!');
    } catch (error) {
      console.error('❌ Retry failed:', error);
      const errorMessage = `Retry failed: ${(error as Error).message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch question data on component mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);

        const questionData = await questionApi.getQuestionById(questionId);

        
        setQuestion(questionData);
        setRawQuestionData(questionData); // Store raw data for debugging
        setCode(questionData.incorrect_code || '# Write your code here\n');

      } catch (error) {
        const errorMessage = `Failed to load question: ${(error as Error).message}`;
        setError(errorMessage);
        toast.error(errorMessage);
        setQuestion(null);
      } finally {
        setLoading(false);
}
    };

    if (questionId) {
      fetchQuestion();
    } else {
      console.error('CodeEditorPage: No questionId provided!');
      setError('No question ID provided');
      setLoading(false);
    }
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black" style={{ fontFamily: 'Patrick Hand, cursive' }}>Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4" style={{ fontFamily: 'Patrick Hand, cursive' }}>
            Question not found! (ID: {questionId})
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Please check the browser console for detailed error information.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={retryFetchQuestion} 
              className="border-2 border-green-500 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 w-full font-semibold"
            >
              Retry Loading Question
            </Button>
            <Button onClick={onBack} className="border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 w-full">
              Back to Challenges
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="border-2 border-gray-400 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-full"
            >
              Reload Page
            </Button>
            <Button 
              onClick={runDiagnostics} 
              className="border-2 border-blue-400 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 w-full text-sm"
            >
              Run Diagnostics (Check Console)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fetchSubmissionLogs = async () => {
    try {
      const response = await questionApi.getQuestionLogs(questionId);
      setSubmissionLogs(response.logs);
      setQuestionViewedAt(response.Question_viewded_at);
    } catch (error) {
      console.error('Failed to fetch submission logs:', error);
      toast.error('Failed to load submission history');
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running!');
      return;
    }
    setIsRunning(true);
    setActiveTab('code');
    setShowOutput(true);
    setOutput('Running Python code... Please wait...');
    setRunResults(null);

    try {
      const response = await submissionApi.submitCode(code, question._id);
      
      setRunResults({
        title: question.title,
        passedCount: response.passedCount,
        totalTests: question.test_cases.length,
        newScore: response.newScore,
        visibleResults: response.results.slice(0, 3),
        hiddenCount: Math.max(0, response.results.length - 3)
      });

      toast.success(`${response.passedCount}/${question.test_cases.length} testcases passed!`);
    } catch (error: any) {
      setOutput(`❌ Error: ${error.response?.data?.message || error.message || 'An unknown error occurred'}`);
      setRunResults(null);
      toast.error('Code execution failed');
    } finally {
      setIsRunning(false);
    }
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
            {question?.title || rawQuestionData?.title || `Question ${questionId}` || 'Untitled Question'}
          </h1>
          <div
            className="border-2 border-black text-black px-4 py-2 rounded-lg bg-white hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {currentUserRank ? `Rank #${currentUserRank}` : 'Not Ranked'}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Statement */}
        <div className="w-2/5 border-r-2 border-black p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Patrick Hand, cursive' }}>
            Problem Statement
          </h2>
          
          {/* Emergency fallback using raw data */}
          {!question?.description && rawQuestionData?.description && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="font-bold text-blue-800">🔧 Emergency Fallback (Using Raw Data):</p>
              <div className="whitespace-pre-line text-gray-800 leading-relaxed mt-2">
                {rawQuestionData.description}
              </div>
            </div>
          )}
          
          <div className="prose max-w-none" style={{ fontFamily: 'Inter, sans-serif' }}>
            {(() => {
              if (question?.description) {
                return (
                  <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                    {question.description}
                  </div>
                );
              } else if (question) {
                return (
                  <div className="text-yellow-600 p-4 border border-yellow-300 rounded bg-yellow-50">
                    <p className="font-bold">⚠️ Problem description is missing!</p>
                    <p>The question was loaded but has no description field.</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer">Raw question data:</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                        {JSON.stringify(question, null, 2)}
                      </pre>
                    </details>
                  </div>
                );
              } else {
                return (
                  <div className="text-red-600 p-4 border border-red-300 rounded">
                    <p className="font-bold">❌ No question data available!</p>
                    <p>The question failed to load completely.</p>
                  </div>
                );
              }
            })()}
          </div>

          {/* Code Display Section */}
          {(question?.incorrect_code || rawQuestionData?.incorrect_code) && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                Starting Code
              </h3>
              <div className="border-2 border-black rounded-lg p-4 bg-gray-50">
                <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap" style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                  {question?.incorrect_code || rawQuestionData?.incorrect_code}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tabs: Code | Submissions */}
        <div className="w-3/5 flex flex-col">
          <div className="p-6 pb-0 overflow-y-auto">
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
                  <span>Code Editor</span>
                </TabsTrigger>
                <TabsTrigger
                  value="submissions"
                  className="px-4 py-2 rounded-md border-2 border-transparent flex items-center gap-2 transition-colors data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11v6M9 14h6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 3l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Submissions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-4">
                <div className="p-2">
                  <Label className="text-lg font-bold mb-4 block" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                    Code Editor (Python)
                  </Label>
                  <div className="w-full border-2 border-black rounded-lg overflow-hidden mb-6" style={{ height: showOutput ? '320px' : '384px' }}>
                    {monacoError ? (
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full font-mono text-sm p-4 resize-none bg-gray-800 text-white border-none rounded-none"
                        placeholder="# Fallback editor - Monaco failed to load\n# Write your Python code here..."
                        style={{
                          fontFamily: 'Monaco, Consolas, monospace',
                          lineHeight: '1.6'
                        }}
                      />
                    ) : (
                      <Editor
                        height="100%"
                        defaultLanguage="python"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        loading={<div className="flex items-center justify-center h-full bg-gray-800 text-white">Loading Monaco Editor...</div>}
                        onMount={(editor) => {
                          console.log('Monaco Editor mounted successfully');
                          editor.focus();
                        }}
                        beforeMount={(_monaco) => {
                          console.log('Monaco Editor initializing...');
                        }}
                        options={{
                          fontSize: 14,
                          fontFamily: 'Monaco, Consolas, monospace',
                          lineHeight: 1.6,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: 'on',
                          lineNumbers: 'on',
                          renderWhitespace: 'selection',
                          bracketPairColorization: { enabled: true },
                          suggestOnTriggerCharacters: true,
                          acceptSuggestionOnEnter: 'on',
                          tabSize: 4,
                          insertSpaces: true,
                        }}
                      />
                    )}
                  </div>

{showOutput && (
  <div className='w-[800px] h-[500px]'>
  <div className="mt-4 mb-6">
    <div className="flex items-center justify-between mb-3">
      <Label
        className="text-lg font-bold"
        style={{ fontFamily: "Patrick Hand, cursive" }}
      >
        Output Console
      </Label>
      <Button
        onClick={() => setShowOutput(false)}
        className="text-xs px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
      >
        ✕ Close
      </Button>
    </div>

<div
  className="w-[800px] h-[500px] border-2 border-gray-800 rounded-lg font-mono text-sm overflow-y-auto overflow-x-hidden p-4"
  style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
>
  <div className="w-full">
    {!runResults && (
      <pre className="whitespace-pre-wrap text-green-400">
        {output || "> Ready to run your code..."}
      </pre>
    )}

    {runResults && (
      <div className="space-y-4">
        {/* Summary Box */}
        <div className="w-full border border-gray-700 rounded-lg p-4 bg-[#2a2d2e] text-gray-100">
          <div className="text-lg mb-2 font-semibold">Results Summary</div>
          <div className="text-green-400">
            Testcases Passed: {runResults.passedCount}/{runResults.totalTests}
          </div>
          <div className="text-blue-400">
            New Score: {runResults.newScore}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {runResults.visibleResults.map((result, index) => (
            <div
              key={index}
              className={`w-full border rounded-lg shadow-md ${
                result.passed ? "border-green-500" : "border-red-500"
              }`}
            >
              <div
                className={`p-3 font-bold ${
                  result.passed
                    ? "bg-green-800 text-green-100"
                    : "bg-red-800 text-red-100"
                }`}
              >
                Test Case {index + 1}:{" "}
                {result.passed ? "✅ PASSED" : "❌ FAILED"}
              </div>
              <div className="p-4 bg-[#2a2d2e] text-gray-200 space-y-3">
                <div className="bg-[#1e1e1e] rounded p-2 border border-gray-700">
                  <span className="text-gray-400">Input:</span>
                  <pre className="mt-1 text-gray-100 font-mono overflow-x-auto">
                    {result.input}
                  </pre>
                </div>
                <div className="bg-[#1e1e1e] rounded p-2 border border-gray-700">
                  <span className="text-gray-400">Expected:</span>
                  <pre className="mt-1 text-gray-100 font-mono overflow-x-auto">
                    {result.expectedOutput}
                  </pre>
                </div>
                <div className="bg-[#1e1e1e] rounded p-2 border border-gray-700">
                  <span className="text-gray-400">Actual Output:</span>
                  <pre className="mt-1 text-gray-100 font-mono overflow-x-auto whitespace-pre-wrap">
                    {result.actualOutput}
                  </pre>
                </div>
                {result.error && (
                  <div className="bg-[#1e1e1e] rounded p-2 border border-gray-700">
                    <span className="text-gray-400">Error:</span>
                    <pre className="mt-1 text-red-400 font-mono overflow-x-auto whitespace-pre-wrap">
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}

          {runResults.hiddenCount > 0 && (
            <div className="text-center p-3 border border-gray-600 rounded-lg bg-[#2a2d2e] text-gray-400">
              {runResults.hiddenCount} more test case
              {runResults.hiddenCount > 1 ? "s are" : " is"} hidden
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

  </div>
  </div>
)}


                  <div className="mt-8 mb-6">
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="w-full py-4 px-8 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                      style={{ fontFamily: 'Patrick Hand, cursive' }}
                    >
                      {isRunning ? 'Running Code...' : 'Run Code'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="mt-4">
                <div className="p-4">
                  <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                    Submission History
                  </h2>
                  
                  <div className="w-full border-2 border-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-[#1e1e1e] p-4">
                      <div className="space-y-4">
                        {[...submissionLogs]
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((log) => (
                          <div
                            key={log._id}
                            className={`p-4 rounded-lg border mb-2 ${
                              log.status === 'accepted' 
                                ? 'border-green-500 bg-green-900/20' 
                                : 'border-red-500 bg-red-900/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 m-[1px]">
                                {log.status === 'accepted' ? (
                                  <span className="text-green-400 text-lg">✅</span>
                                ) : (
                                  <span className="text-red-400 text-lg">❌</span>
                                )}
                                <span className={`font-semibold ${
                                  log.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {submissionLogs.length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            No submissions yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {questionViewedAt && (
                    <div className="mt-4 text-sm text-gray-500">
                      First viewed: {new Date(questionViewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}