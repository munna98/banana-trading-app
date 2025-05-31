// pages/_error.js

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Ban, Frown, Bomb, XCircle, HelpCircle,
  RefreshCcw, Home, ArrowLeft, LifeBuoy, Mail, Book
} from 'lucide-react'; // Import Lucide icons

/**
 * Custom Error Page Component
 * Handles various HTTP errors and provides a themed, interactive user experience.
 *
 * @param {object} props - Component properties.
 * @param {number} props.statusCode - The HTTP status code of the error.
 * @param {Error} [props.err] - The actual error object, useful for logging.
 */
function Error({ statusCode, err }) {
  const router = useRouter();

  // Log error for monitoring and debugging
  useEffect(() => {
    if (err) {
      console.error('An error occurred:', err);
      // Integrate with error tracking services like Sentry here:
      // Sentry.captureException(err);
    }
  }, [err]);

  /**
   * Provides specific messages and icons based on the HTTP status code.
   * @param {number} code - The HTTP status code.
   * @returns {{title: string, message: icon: React.ComponentType}} Error information.
   */
  const getErrorMessage = (code) => {
    switch (code) {
      case 404:
        return {
          title: "Kola Not Found!",
          message: "Don't worry, your Kola is in safe hands.",
          icon: Frown // Lucide Frown icon for 404
        };
      case 500:
        return {
          title: "Banana Plantation Down!",
          message: "Our banana processing system encountered an unexpected error. Our monkeys are working on it!",
          icon: Bomb // Lucide Bomb icon for 500
        };
      case 403:
        return {
          title: "Access Denied!",
          message: "You don't have permission to access this banana trading area.",
          icon: Ban // Lucide Ban icon for 403
        };
      case 400:
        return {
          title: "Bad Banana Request!",
          message: "Something went wrong with your banana trading request.",
          icon: XCircle // Lucide XCircle icon for 400
        };
      default:
        return {
          title: "Banana Trading Error!",
          message: "An unexpected error occurred in our banana trading system.",
          icon: HelpCircle // Lucide HelpCircle icon for general error
        };
    }
  };

  const errorInfo = getErrorMessage(statusCode);
  const IconComponent = errorInfo.icon; // Get the component for rendering

  // Event handlers for action buttons
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="text-6xl mb-6 animate-bounce text-yellow-500">
          <IconComponent size={64} className="mx-auto" /> {/* Render Lucide icon */}
        </div>

        {/* Error Code */}
        <div className="text-yellow-600 font-bold text-lg mb-2">
          Error {statusCode}
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {errorInfo.title}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {errorInfo.message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCcw size={20} /> Try Again
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Go Back
          </button>

          <Link href="/" passHref> {/* Use passHref for Link wrapping a custom component */}
            <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
              <Home size={20} /> Home
            </button>
          </Link>
        </div>

        {/* Additional Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Need help with banana trading?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/support" className="text-yellow-600 hover:text-yellow-700 underline flex items-center gap-1">
              <LifeBuoy size={16} /> Support
            </Link>
            <Link href="/contact" className="text-yellow-600 hover:text-yellow-700 underline flex items-center gap-1">
              <Mail size={16} /> Contact
            </Link>
            <Link href="/docs" className="text-yellow-600 hover:text-yellow-700 underline flex items-center gap-1">
              <Book size={16} /> Docs
            </Link>
          </div>
        </div>

        {/* Development Info (only show in development) */}
        {process.env.NODE_ENV === 'development' && err && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              🐛 Debug Info (Dev Only)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
              <pre>{err.stack || err.toString()}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Pages Router specific: getInitialProps to fetch the status code
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, err }; // Pass err along for logging in useEffect
};

export default Error;