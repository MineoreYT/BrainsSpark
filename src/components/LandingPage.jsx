import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">BrainSpark</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Login
              </button>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Make Quizzes <span className="text-indigo-600">Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, share, and grade quizzes in minutes. BrainSpark helps teachers save time and students learn better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start Free Today →
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold text-lg"
              >
                Learn More
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✓ Free forever &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ 2-minute setup
            </p>
          </div>

          {/* App Mockup */}
          <div className="mt-16 bg-white rounded-xl shadow-2xl p-4 max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600 ml-4">
                  brainspark.app/teacher/dashboard
                </div>
              </div>
              
              {/* App Interface */}
              <div className="bg-white h-full p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BS</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="text-sm text-gray-600">Ms. Johnson</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-blue-600">Active Quizzes</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-xs text-green-600">Students</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-xs text-purple-600">Avg Score</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">5</div>
                    <div className="text-xs text-orange-600">Classes</div>
                  </div>
                </div>

                {/* Recent Quizzes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Quizzes</h3>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">Chapter 5: Photosynthesis</div>
                        <div className="text-xs text-gray-500">Biology • 15 questions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">92% avg</div>
                        <div className="text-xs text-gray-500">28 responses</div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">World War II Timeline</div>
                        <div className="text-xs text-gray-500">History • 20 questions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">85% avg</div>
                        <div className="text-xs text-gray-500">31 responses</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features that make teaching easier</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Quizzes Fast</h3>
              <p className="text-gray-600">
                Build quizzes in minutes with multiple choice and text questions. No complicated setup required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Grading</h3>
              <p className="text-gray-600">
                Quizzes are graded instantly. Students get immediate feedback, you save hours of work.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                See detailed analytics on student performance. Identify who needs help and who's excelling.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Lessons</h3>
              <p className="text-gray-600">
                Post lessons with content and links. Keep all your class materials in one place.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Classes</h3>
              <p className="text-gray-600">
                Organize students into classes. Share a simple code and students can join instantly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">
                Works perfectly on phones, tablets, and computers. Students can take quizzes anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up Free</h3>
              <p className="text-gray-600">
                Create your account in 30 seconds. Choose teacher or student role.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Class</h3>
              <p className="text-gray-600">
                Set up a class and get a unique code. Share it with your students.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Teaching</h3>
              <p className="text-gray-600">
                Create quizzes, post lessons, and watch your students learn!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join teachers who are saving hours every week with BrainSpark
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-xl"
          >
            Get Started Free →
          </button>
          <p className="text-indigo-200 mt-4">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BrainSpark</h3>
              <p className="text-gray-400">Making education better, one quiz at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BrainSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
