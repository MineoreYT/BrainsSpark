import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-700"
              >
                BrainSpark
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <div>
            <p className="text-gray-600 mb-4">
              <strong>Last Updated:</strong> January 22, 2026
            </p>
            <p className="text-gray-700">
              BrainSpark ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you register for BrainSpark, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Account type (teacher or student)</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Quiz responses and scores</li>
              <li>Class enrollment information</li>
              <li>Lesson views and interactions</li>
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Providing and maintaining our educational services</li>
              <li>Creating and managing your account</li>
              <li>Processing quiz submissions and calculating grades</li>
              <li>Enabling communication between teachers and students</li>
              <li>Generating analytics and performance reports</li>
              <li>Improving our platform and user experience</li>
              <li>Sending important updates and notifications</li>
              <li>Ensuring platform security and preventing fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>With Teachers:</strong> Students' quiz responses and grades are shared with their enrolled teachers</li>
              <li><strong>With Classmates:</strong> Your name may be visible to other students in your classes</li>
              <li><strong>Service Providers:</strong> We use Firebase (Google) for authentication and data storage</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure password hashing</li>
              <li>Firebase Authentication security</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Content Security Policy (CSP) headers</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us. Some information may be retained for legal or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
            <p className="text-gray-700">
              BrainSpark is designed for educational use and may be used by students of all ages. We comply with applicable children's privacy laws, including COPPA (Children's Online Privacy Protection Act). We recommend that students under 13 use the platform under parental or teacher supervision. We do not knowingly collect personal information from children under 13 without parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of non-essential communications</li>
              <li>Withdraw consent where applicable</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookies through your browser settings, but disabling them may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              BrainSpark uses the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Firebase (Google):</strong> Authentication, database, and hosting</li>
              <li><strong>Vercel:</strong> Web hosting and deployment</li>
            </ul>
            <p className="text-gray-700 mt-4">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Users</h2>
            <p className="text-gray-700">
              BrainSpark is operated from the Philippines. If you access our platform from outside the Philippines, your information may be transferred to and processed in the Philippines or other countries where our service providers operate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of BrainSpark after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@brainspark.app</p>
              <p className="text-gray-700"><strong>GitHub:</strong> <a href="https://github.com/MineoreYT/BrainsSpark" className="text-indigo-600 hover:text-indigo-700">github.com/MineoreYT/BrainsSpark</a></p>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
            <p className="text-gray-700">
              We collect and use your information to provide educational services, improve our platform, and ensure security. We do not sell your data. You have control over your information and can request access, correction, or deletion at any time. We are committed to protecting your privacy and maintaining transparency about our data practices.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2026 BrainSpark. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
