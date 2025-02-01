const TermsAndConditions = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Terms and Conditions
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Welcome to{" "}
          <span className="font-semibold text-indigo-600">Sphere</span>. By
          accessing or using our platform, you agree to comply with and be bound
          by the following terms and conditions. Please read them carefully.
        </p>

        <div className="space-y-8">
          {/* Section 1: Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600">
              These Terms and Conditions (&quot;Terms&quot;) govern your use of
              the Sphere social media platform (&quot;Platform&quot;), operated
              by Sphere Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). By registering, accessing, or using the
              Platform, you agree to these Terms. If you do not agree, you must
              not use the Platform.
            </p>
          </section>

          {/* Section 2: User Obligations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. User Obligations
            </h2>
            <p className="text-gray-600 mb-4">
              As a user of Sphere, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Provide accurate and complete information during registration.
              </li>
              <li>Maintain the security of your account and password.</li>
              <li>
                Not engage in any activity that disrupts or interferes with the
                Platform.
              </li>
              <li>Comply with all applicable laws and regulations.</li>
              <li>
                Not use the Platform for any illegal or unauthorized purpose.
              </li>
            </ul>
          </section>

          {/* Section 3: Content Ownership */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Content Ownership
            </h2>
            <p className="text-gray-600">
              You retain ownership of all content you post on Sphere. However,
              by posting content, you grant us a worldwide, non-exclusive,
              royalty-free license to use, reproduce, modify, and distribute
              your content for the purpose of operating and promoting the
              Platform.
            </p>
          </section>

          {/* Section 4: Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Privacy
            </h2>
            <p className="text-gray-600">
              Your privacy is important to us. Please review our{" "}
              <a
                href="/privacy-policy"
                className="text-indigo-600 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              to understand how we collect, use, and protect your personal
              information.
            </p>
          </section>

          {/* Section 5: Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. Disclaimers
            </h2>
            <p className="text-gray-600 mb-4">
              The Platform is provided &quot;as is&quot; and &quot;as
              available&quot; without any warranties of any kind, either express
              or implied. We do not guarantee that:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>The Platform will be uninterrupted or error-free.</li>
              <li>
                The content on the Platform is accurate, complete, or reliable.
              </li>
              <li>The Platform will meet your requirements or expectations.</li>
            </ul>
          </section>

          {/* Section 6: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-600">
              To the fullest extent permitted by law, Sphere Inc. shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of profits,
              data, or use, arising out of or related to your use of the
              Platform.
            </p>
          </section>

          {/* Section 7: Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              7. Termination
            </h2>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate your access to the
              Platform at any time, with or without notice, for any reason,
              including but not limited to a violation of these Terms.
            </p>
          </section>

          {/* Section 8: Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              8. Governing Law
            </h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with
              the laws of the State of California, without regard to its
              conflict of law principles.
            </p>
          </section>

          {/* Section 9: Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-600">
              We may update these Terms from time to time. Any changes will be
              posted on this page, and your continued use of the Platform after
              such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Section 10: Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at{" "}
              <a
                href="mailto:support@sphere.com"
                className="text-indigo-600 hover:underline"
              >
                support@sphere.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            By using Sphere, you acknowledge that you have read, understood, and
            agree to these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
