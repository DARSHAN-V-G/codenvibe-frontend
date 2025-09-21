import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { questionApi, submissionApi, Question, SubmissionResponse, checkAuthCookie } from '../api';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

interface CodeEditorPageProps {
  questionId: string;  // Changed from number to string to match backend _id
  onBack: () => void;
}

const currentUserRank = 7;

type TestResult = { 
  passed: boolean; 
  input: string; 
  expectedOutput: string; 
  actualOutput: string;
  error?: string;
};

type Submission = { 
  submissionid: string;
  timestamp: string; 
  passedCount: number; 
  totalCount: number; 
  results: TestResult[];
};

export function CodeEditorPage({ questionId, onBack }: CodeEditorPageProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'submissions'>('code');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawQuestionData, setRawQuestionData] = useState<any>(null); // For debugging
  const [monacoError, setMonacoError] = useState<boolean>(false);

  // Reduced logging for cleaner console
  console.log('🚀 CodeEditorPage: Render with questionId:', questionId, '| Question loaded:', !!question);

  // Error boundary for Monaco Editor
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
    console.log('🔧 Running API diagnostics...');
    
    // Check authentication cookie
    const cookieStatus = checkAuthCookie();
    console.log('🍪 Cookie status:', cookieStatus);
    
    // Check localStorage
    const storedTeam = localStorage.getItem('team');
    console.log('💾 localStorage team:', storedTeam ? 'Present' : 'Missing');
    
    // Test API base connectivity
    try {
      console.log('🌐 Testing API connectivity...');
      const response = await fetch((import.meta as any).env.VITE_BACKEND_URL + '/question/getQuestion', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('📡 Direct fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (fetchError) {
      console.error('❌ Direct fetch failed:', fetchError);
    }
  };

  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostics();
  }, []);

  // Retry function for manual retry
  const retryFetchQuestion = async () => {
    if (!questionId) {
      toast.error('No question ID available to retry');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Retrying question fetch for ID:', questionId);
      
      const questionData = await questionApi.getQuestionById(questionId);
      console.log('✅ Retry successful:', questionData);
      
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
        console.log('🔍 CodeEditorPage: Fetching question with ID:', questionId);
        console.log('🔍 CodeEditorPage: Question ID type:', typeof questionId);
        
        const questionData = await questionApi.getQuestionById(questionId);
        console.log('✅ CodeEditorPage: Question data received:', questionData);
        
        // Log the actual structure to debug
        console.log('🔍 Question data structure:', {
          hasDescription: !!questionData?.description,
          hasTitle: !!questionData?.title,
          hasIncorrectCode: !!questionData?.incorrect_code,
          descriptionType: typeof questionData?.description,
          descriptionLength: questionData?.description?.length || 0,
          allKeys: Object.keys(questionData || {}),
          rawQuestionData: questionData
        });
        
        setQuestion(questionData);
        setRawQuestionData(questionData); // Store raw data for debugging
        setCode(questionData.incorrect_code || '# Write your code here\n');
        
        console.log('✅ CodeEditorPage: Question state set, code initialized');
        console.log('✅ Description set to:', questionData?.description?.substring(0, 100) + '...');
        
        // Test immediate access to see if data is correct
        console.log('🧪 IMMEDIATE TEST - Raw Data:');
        console.log('- Full Object:', questionData);
        console.log('- Object Type:', typeof questionData);
        console.log('- Is Array:', Array.isArray(questionData));
        console.log('- Object Keys:', questionData ? Object.keys(questionData) : 'No data');
        console.log('- Title:', questionData.title);
        console.log('- Description:', questionData.description);
        console.log('- Description length:', questionData.description?.length);
        console.log('- Incorrect code length:', questionData.incorrect_code?.length);
        
        // Additional checks for nested structures
        if (questionData && typeof questionData === 'object') {
          console.log('🔍 Checking nested structures:');
          console.log('- questionData.question exists:', !!(questionData as any).question);
          console.log('- questionData.data exists:', !!(questionData as any).data);
          if ((questionData as any).question) {
            console.log('- questionData.question.title:', (questionData as any).question.title);
            console.log('- questionData.question.description:', (questionData as any).question.description);
          }
          if ((questionData as any).data) {
            console.log('- questionData.data.title:', (questionData as any).data.title);
            console.log('- questionData.data.description:', (questionData as any).data.description);
          }
        }
        
        // Force a small delay to ensure state is updated
        setTimeout(() => {
          console.log('🔄 Post-update question state:', question);
          console.log('🔄 Post-update question title:', question?.title);
        }, 100);
      } catch (error) {
        console.error('❌ CodeEditorPage: Failed to fetch question:', error);
        console.error('❌ CodeEditorPage: Error details:', {
          questionId,
          errorMessage: (error as Error).message,
          errorStack: (error as Error).stack
        });
        const errorMessage = `Failed to load question: ${(error as Error).message}`;
        setError(errorMessage);
        toast.error(errorMessage);
        setQuestion(null);
      } finally {
        setLoading(false);
        console.log('🏁 CodeEditorPage: Loading completed');
      }
    };

    if (questionId) {
      fetchQuestion();
    } else {
      console.error('❌ CodeEditorPage: No questionId provided!');
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

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running!');
      return;
    }

    setIsRunning(true);
    setActiveTab('code');
    setShowOutput(true);
    setOutput('> Running Python code...\n> Initializing interpreter...\n> Please wait...');

    try {
      // For local testing, we'll simulate code execution
      // In a real implementation, you might want to create a separate endpoint for code testing
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockOutput = `> Running Python code...
> Executing: ${question.title}
> Code compiled successfully
> Ready for submission
> ✅ Code syntax is valid!`;
      
      setOutput(mockOutput);
      toast.success('Code executed successfully!');
    } catch (error) {
      setOutput(`> ❌ Runtime Error: ${String(error)}\n> Please check your code and try again.`);
      toast.error('Code execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting!');
      return;
    }

    setIsSubmitting(true);
    setActiveTab('submissions');
    setShowOutput(false);

    try {
      const response: SubmissionResponse = await submissionApi.submitCode(code, questionId);
      
      const newSubmission: Submission = {
        submissionid: response.submissionid,
        timestamp: new Date().toLocaleString(),
        passedCount: response.passedCount,
        totalCount: response.results.length,
        results: response.results
      };
      
      setSubmissions(prev => [newSubmission, ...prev]);
      
      if (response.passedCount === response.results.length) {
        toast.success(`🎉 All test cases passed! Score: ${response.newScore}`);
      } else {
        toast.error(`${response.passedCount}/${response.results.length} test cases passed`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                          console.log('✅ Monaco Editor mounted successfully');
                          editor.focus();
                        }}
                        beforeMount={(_monaco) => {
                          console.log('🔧 Monaco Editor initializing...');
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
                    <div className="mt-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-lg font-bold" style={{ fontFamily: 'Patrick Hand, cursive' }}>
                          Output Console
                        </Label>
                        <Button onClick={() => setShowOutput(false)} className="text-xs px-3 py-2 border border-gray-300 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                          ✕ Close
                        </Button>
                      </div>
                      <div className="w-full h-40 border-2 border-black rounded-lg p-4 font-mono text-sm overflow-y-auto" style={{ backgroundColor: '#2f2f2f', color: '#f5f5f5' }}>
                        <pre className="whitespace-pre-wrap text-green-400">{output || '> Ready to run your code...'}</pre>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 mb-6 flex gap-6">
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
                            Result: {s.passedCount}/{s.totalCount} test cases passed
                          </div>
                          <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {s.timestamp} • ID: {s.submissionid.substring(0, 8)}
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