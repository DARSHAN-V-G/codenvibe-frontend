import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { questionApi } from '@/api';
import { useAuthContext } from '@/contexts/AuthContext';

interface Question {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface QuestionListPageProps {
  onSelectQuestion: (questionId: string) => void;
}

export function QuestionListPage({ onSelectQuestion }: QuestionListPageProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const questionsData = await questionApi.getQuestions();
      setQuestions(questionsData);
      console.log(`Loaded ${questionsData.length} questions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchQuestions();
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div style={styles.centered}>
        <p style={styles.loadingText}>Loading questions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.centered}>
        <p style={styles.loadingText}>Please log in to view questions.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorBox}>
          <h1 style={styles.errorTitle}>Error Loading Questions</h1>
          <p style={styles.errorText}>{error}</p>
          <Button onClick={fetchQuestions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fb', fontFamily: 'Comic Neue, sans-serif' }}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navbarInner}>
          <div style={styles.navLeft}>Vibe n Code</div>
          <div style={styles.navLinks}>
            <button style={{ ...styles.navButton, ...styles.activeButton }}>Challenges</button>
            <button style={styles.navButton}>Leaderboard</button>
            <button style={styles.navButton}>Logout</button>
          </div>
        </div>
      </nav>

      <hr style={styles.divider} />

      {/* Header */}
      <section style={styles.section}>
        <h1 style={styles.pageTitle}>Debugging Challenges</h1>
        <p style={styles.subtitle}>Choose a challenge and start debugging!</p>

        <div style={styles.grid}>
          {questions.map((question) => (
            <div
              key={question._id}
              style={{
                ...styles.card,
                ...(question.completed ? styles.completedCard : {}),
              }}
              onClick={() => onSelectQuestion(question._id)}
            >
              {question.completed && <span style={styles.tick}>✔</span>}
              <h2 style={styles.cardTitle}>{question.title}</h2>
              <p style={styles.cardText}>{question.description}</p>
              <button style={styles.cardButton}>
                {question.completed ? 'View Solution' : 'Start Challenge'}
              </button>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.errorBox}>
              <h3 style={styles.errorTitle}>No challenges available</h3>
              <p style={styles.errorText}>Check back later for new debugging challenges.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  centered: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#444',
    fontSize: '1.1rem',
  },
  errorBox: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#222',
  },
  errorText: {
    color: '#666',
    marginBottom: '1rem',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '2px solid #000',
    padding: '0.75rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navbarInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#000',
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: '1px solid #000',
    color: '#000',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  activeButton: {
    backgroundColor: '#000',
    color: '#fff',
  },
  divider: {
    border: 'none',
    borderTop: '2px solid #000',
    margin: 0,
  },
  section: {
    padding: '2rem 0',
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginBottom: '0.4rem',
    color: '#000',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#444',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    padding: '0 2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    border: '1px solid #000',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    position: 'relative',
    transition: 'box-shadow 0.2s ease',
  },
  completedCard: {
    border: '2px solid #28a745',
    backgroundColor: '#f0fff4',
  },
  tick: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '1.2rem',
    color: '#28a745',
    backgroundColor: '#e6f4ea',
    borderRadius: '50%',
    padding: '0.3rem 0.5rem',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '0.4rem',
  },
  cardText: {
    fontSize: '0.9rem',
    color: '#444',
    marginBottom: '1rem',
  },
  cardButton: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 2rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
};
//*test//