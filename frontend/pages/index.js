import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CareerCholara
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Assess your career potential with aptitude tests and resume analysis
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Aptitude Tests</h2>
            <p className="text-gray-600">
              Test your quantitative, logical, and verbal reasoning skills
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Resume Analysis</h2>
            <p className="text-gray-600">
              Get AI-powered feedback on your resume
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Career Insights</h2>
            <p className="text-gray-600">
              Understand your strengths and areas for improvement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

