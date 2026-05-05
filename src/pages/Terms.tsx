import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function Terms() {
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
        <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Afin Track, you agree to be bound by these
            Terms of Service. If you disagree with any part of the terms, you may
            not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">2. Description of Service</h2>
          <p>
            Afin Track is a personal financial dashboard and expense tracker application. 
            The service provides tools and charts to assist you with tracking your income 
            and expenditures. 
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">3. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is
            accurate, complete, and current at all times. Failure to do so constitutes
            a breach of the Terms, which may result in immediate termination of your
            account on our Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">4. Limitation of Liability</h2>
          <p>
            In no event shall Afin Track, nor its developers, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of
            or inability to access or use the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">5. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of
            your jurisdiction, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
}
