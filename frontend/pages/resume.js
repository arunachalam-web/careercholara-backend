import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { api } from '../lib/api';

export default function Resume() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please enter your resume text');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const data = await api.post('/resume/analyze', { resumeText });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Resume Analysis</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Paste your resume text here
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your resume content..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </form>

        {analysis && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>

            {analysis.score && (
              <div className="mb-4">
                <div className="text-3xl font-bold text-indigo-600">
                  Score: {analysis.score}/100
                </div>
              </div>
            )}

            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-green-700">Strengths</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-gray-700">{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.improvements && analysis.improvements.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-yellow-700">Areas for Improvement</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 text-blue-700">Suggestions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.note && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-600">
                {analysis.note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

