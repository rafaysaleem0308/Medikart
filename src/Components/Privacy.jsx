import React from "react";
import { Link } from "react-router-dom";
import "../styles/legal.css"; // Assuming you have a CSS file for styling

const Policy = () => {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="update-date">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      <div className="legal-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            Medikart collects personal information to provide and improve our
            pharmacy services. The types of information we collect include:
          </p>
          <ul>
            <li>
              <strong>Personal Identification:</strong> Full name, date of
              birth, gender, government-issued identification numbers (where
              required by law)
            </li>
            <li>
              <strong>Contact Information:</strong> Email address, phone number,
              residential address, shipping address
            </li>
            <li>
              <strong>Health Information:</strong> Prescription details, medical
              history, allergies, health insurance information, physician
              details
            </li>
            <li>
              <strong>Financial Information:</strong> Payment card details
              (processed securely), billing address, insurance payment
              information
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device
              information, usage patterns, cookies and similar tracking
              technologies
            </li>
            <li>
              <strong>Communication Records:</strong> Copies of your
              correspondence with our customer service team, pharmacist
              consultations
            </li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>
              <strong>Service Provision:</strong>
              <ul>
                <li>Process and fulfill your medication orders</li>
                <li>Verify prescriptions with healthcare providers</li>
                <li>Provide pharmacist consultations</li>
                <li>Coordinate medication refills and renewals</li>
              </ul>
            </li>
            <li>
              <strong>Communication:</strong>
              <ul>
                <li>Send order confirmations and shipping notifications</li>
                <li>Provide medication reminders and safety information</li>
                <li>Respond to customer service inquiries</li>
                <li>Send important service updates</li>
              </ul>
            </li>
            <li>
              <strong>Legal Compliance:</strong>
              <ul>
                <li>Comply with pharmacy regulations and laws</li>
                <li>Prevent fraudulent transactions</li>
                <li>Maintain proper pharmacy records as required by law</li>
              </ul>
            </li>
            <li>
              <strong>Service Improvement:</strong>
              <ul>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Develop new features and services</li>
                <li>Conduct research to enhance medication safety</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Data Sharing and Disclosure</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>
              <strong>Healthcare Providers:</strong> With your prescribing
              physicians and other healthcare professionals involved in your
              care
            </li>
            <li>
              <strong>Service Providers:</strong> With trusted third parties who
              assist in payment processing, shipping, IT services, and other
              business operations
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or in
              response to valid legal process (court orders, subpoenas)
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with any
              merger, sale of company assets, or acquisition
            </li>
            <li>
              <strong>Public Health:</strong> As required for public health
              activities, including adverse event reporting
            </li>
          </ul>
          <p>
            We never sell your personal health information to third parties for
            marketing purposes.
          </p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement robust security measures to protect your sensitive
            health information:
          </p>
          <ul>
            <li>
              <strong>Encryption:</strong> All data transmissions are encrypted
              using TLS 1.2+ protocols
            </li>
            <li>
              <strong>Access Controls:</strong> Strict role-based access to
              personal health information
            </li>
            <li>
              <strong>Audit Logs:</strong> Comprehensive logging of all access
              to sensitive data
            </li>
            <li>
              <strong>Physical Security:</strong> Secure facilities with
              controlled access
            </li>
            <li>
              <strong>Employee Training:</strong> Regular HIPAA and privacy
              training for all staff
            </li>
            <li>
              <strong>Regular Testing:</strong> Periodic security assessments
              and penetration testing
            </li>
          </ul>
          <p>
            Despite these measures, no electronic transmission or storage method
            is 100% secure. We cannot guarantee absolute security of your
            information.
          </p>
        </section>

        <section>
          <h2>5. Your Rights and Choices</h2>
          <p>
            Depending on your jurisdiction, you may have the following rights
            regarding your data:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of the personal
              information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate or
              incomplete information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data,
              subject to legal requirements for pharmacy records
            </li>
            <li>
              <strong>Restriction:</strong> Request restriction of processing in
              certain circumstances
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data to
              another provider
            </li>
            <li>
              <strong>Opt-Out:</strong> Opt-out of marketing communications at
              any time
            </li>
          </ul>
          <p>
            To exercise these rights, please contact our Privacy Officer at
            privacy@medikart.com.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information only as long as necessary to:
          </p>
          <ul>
            <li>Provide the services you requested</li>
            <li>
              Comply with legal obligations (typically 7-10 years for pharmacy
              records)
            </li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
        </section>

        <section>
          <h2>7. International Data Transfers</h2>
          <p>
            If we transfer your data outside your country of residence, we
            implement appropriate safeguards as required by applicable laws,
            including standard contractual clauses.
          </p>
        </section>

        <section>
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you
            of significant changes through our website or direct communication.
            Your continued use of our services after such changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our privacy practices:
            <br />
            <br />
            <strong>Medikart Privacy Office</strong>
            <br />
            123 Data Protection Lane
            <br />
            Privacy City, PC 12345
            <br />
            Email: privacy@medikart.com
            <br />
            Phone: (123) 456-7890 (ext. 2 for privacy inquiries)
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

export default Policy;
