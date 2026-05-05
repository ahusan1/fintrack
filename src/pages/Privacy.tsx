import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-8 md:p-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 pb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p>
            When you use Afin Track, we collect the necessary information to
            provide you with our financial tracking services. This includes your
            profile information (like your name and email address when you sign up with Google)
            and the financial data you input into the app (transactions, amounts, descriptions).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to provide the core functionality of
            Afin Track. We use it to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Display your dashboard and track your expenses and income.</li>
            <li>Maintain your account securely using Supabase authentication.</li>
            <li>Continuously improve the application based on user feedback.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Data Security and Privacy</h2>
          <p>
            Your transactions and profile data are stored securely on Supabase.
            Afin Track employs Row-Level Security (RLS) policies within our
            database to mathematically ensure that only you can access, view,
            edit, or delete your own personal records. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Third-Party Authentication</h2>
          <p>
            Afin Track uses Google OAuth to seamlessly authenticate you. We adhere
            to the Google API Terms of Service and only request the necessary
            scopes (email and basic profile) required to provision your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. By continuing to
            use Afin Track after any such changes, you agree to the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}
