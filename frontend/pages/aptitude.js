import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../lib/api';

export default function Aptitude() {
  const router = useRouter();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadQuestion();
  }, [router]);

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedAnswer(null);

    try {
      const data = await api.get('/aptitude/question');
      setQuestion(data);
    } catch (err) {
      setError(err.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAnswer === null) {
      setError('Please select an answer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.post('/aptitude/answer', {
        questionId: question.id,
        selectedAnswer: parseInt(selectedAnswer),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Aptitude Test</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {question && !result && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                {question.category} • {question.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-4">{question.question}</h2>

            <div className="space-y-2 mb-6">
              {question.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-3 border-2 rounded-lg cursor-pointer transition ${
                    selectedAnswer === index.toString()
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={selectedAnswer === index.toString()}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        )}

        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div
              className={`mb-4 p-4 rounded-lg ${
                result.isCorrect
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              <p className="font-semibold text-lg">
                {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="mt-2">
                Correct answer: {result.correctOption}
              </p>
            </div>

            {result.explanation && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Explanation:</h3>
                <p className="text-gray-700">{result.explanation}</p>
              </div>
            )}

            <button
              onClick={loadQuestion}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

