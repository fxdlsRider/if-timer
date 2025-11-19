// components/Auth/LoginModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';

/**
 * LoginModal Component
 *
 * Modal for magic link email authentication
 * Shows email input form and success screen
 *
 * @param {function} onClose - Handler to close the modal
 */
export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await signInWithEmail(email);
      setSuccess(true);
      setMessage('');
    } catch (error) {
      setSuccess(false);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-10 rounded-xl max-w-md w-[90%] text-center border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {!success ? (
          <>
            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">
              Sign in to sync
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Enter your email to sync your timer<br />
              across all your devices. No password needed!
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-lg mb-4 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-4 text-base bg-gray-900 dark:bg-gray-700 text-white border border-black/20 dark:border-gray-600 rounded-lg cursor-pointer mb-3 shadow-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-transparent text-gray-600 dark:text-gray-400 border-none py-3 cursor-pointer text-sm hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                message.includes('✅')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
              }`}>
                {message}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div className="text-5xl mb-5">📧</div>
            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3">
              Check your inbox!
            </h2>
            <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              We sent a magic link to<br />
              <strong className="text-gray-900 dark:text-gray-100">{email}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed mb-5">
              Click the link in the email to sign in.
            </p>

            {/* Close tab instruction */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-gray-900 font-semibold m-0">
                ✓ You can close this tab now
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-4 text-base bg-green-600 text-white border border-black/20 rounded-lg cursor-pointer shadow-xl hover:bg-green-700 transition-colors"
            >
              Got it!
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              💡 The link works on all your devices
            </p>
          </>
        )}
      </div>
    </div>
  );
}
