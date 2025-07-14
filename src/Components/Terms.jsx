import React from "react";
import { Link } from "react-router-dom";
import "../styles/legal.css"; // Assuming you have a CSS file for styling

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h1>Terms of Service</h1>
        <p className="update-date">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Medikart platform ("Service"), you agree
            to be bound by these Terms of Service ("Terms"). If you do not agree
            to all of these Terms, you may not use our Service. These Terms
            apply to all visitors, users, and others who access the Service.
          </p>
          <p>
            We reserve the right to modify or replace these Terms at any time at
            our sole discretion. Your continued use of the Service after any
            such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>2. Account Requirements</h2>
          <p>
            To use certain features of our Service, you must register for an
            account. When creating an account, you agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>
              Maintain the security of your password and accept all risks of
              unauthorized access
            </li>
            <li>
              Notify us immediately if you discover or suspect any security
              breaches
            </li>
            <li>
              Be responsible for all activities that occur under your account
            </li>
          </ul>
          <p>
            You must be at least 18 years old to use our Service. Accounts
            registered by automated methods are not permitted.
          </p>
        </section>

        <section>
          <h2>3. Prescription Medications</h2>
          <p>
            Medikart operates as a licensed digital pharmacy. Certain
            medications available through our Service require a valid
            prescription from a licensed healthcare provider.
          </p>
          <p>By using our Service, you agree that:</p>
          <ul>
            <li>
              All prescription information you provide is accurate and complete
            </li>
            <li>
              You will not attempt to obtain prescription medications without a
              valid prescription
            </li>
            <li>You will not transfer prescriptions to other individuals</li>
            <li>
              You will use medications only as directed by your healthcare
              provider
            </li>
          </ul>
          <p>
            We reserve the right to verify prescriptions with your healthcare
            provider and refuse service if we suspect fraudulent activity.
          </p>
        </section>

        <section>
          <h2>4. Prohibited Conduct</h2>
          <p>
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul>
            <li>
              <strong>Illegal activities:</strong> Using the Service for any
              unlawful purpose or in violation of any local, state, national, or
              international law
            </li>
            <li>
              <strong>Account sharing:</strong> Sharing your account credentials
              or allowing others to access your account
            </li>
            <li>
              <strong>Prescription fraud:</strong> Attempting to obtain
              medications through fraudulent prescriptions or misrepresentation
            </li>
            <li>
              <strong>Commercial use:</strong> Using the Service for any
              commercial purposes without our express written consent
            </li>
            <li>
              <strong>Security violations:</strong> Attempting to interfere
              with, compromise the system integrity or security of the Service
            </li>
            <li>
              <strong>Automated access:</strong> Using any automated system
              (e.g., bots) to access the Service
            </li>
            <li>
              <strong>Misrepresentation:</strong> Impersonating any person or
              entity or falsely stating your affiliation with a person or entity
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of Medikart and its
            licensors. The Service is protected by copyright, trademark, and
            other laws of both the United States and foreign countries.
          </p>
        </section>

        <section>
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach these Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately
            cease. All provisions of these Terms which by their nature should
            survive termination shall survive termination.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Medikart, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2>8. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of [Your State/Country], without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section>
          <h2>9. Contact Information</h2>
          <p>
            For any questions about these Terms, please contact us at:
            <br />
            <br />
            Medikart Customer Support
            <br />
            123 Pharmacy Lane
            <br />
            Healthcare City, HC 12345
            <br />
            Email: legal@medikart.com
            <br />
            Phone: (123) 456-7890
          </p>
        </section>
      </div>

      <div className="legal-footer">
        <Link to="/" className="back-btn">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Terms;
