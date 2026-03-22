import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-of-service',
  template: `
    <div class="legal-page">
      <h1>Terms of Service</h1>
      <p class="last-updated">Last updated: March 22, 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using <strong>unbreaker.app</strong> ("the Service"),
          you agree to be bound by these Terms of Service. If you do not agree,
          do not use the Service.
        </p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>
          Unbreaker is a free-to-use web application that helps users track
          personal progress, participate in group challenges, and build
          positive habits. The Service is provided "as is" without warranty.
        </p>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <ul>
          <li>You must provide a valid email address and choose a username.</li>
          <li>You are responsible for keeping your credentials secure.</li>
          <li>You must be at least 16 years old to create an account (in compliance with GDPR age requirements).</li>
        </ul>
      </section>

      <section>
        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any unlawful purpose.</li>
          <li>Harass, abuse, or harm other users.</li>
          <li>Attempt to gain unauthorised access to the Service or its systems.</li>
          <li>Use bots or automated scripts to interact with the Service beyond normal usage.</li>
          <li>Send spam or offensive content through messages or feedback.</li>
        </ul>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          All content, design, and code of the Service are owned by Unbreaker.
          You may not copy, modify, or distribute any part of the Service
          without prior written permission.
        </p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          Unbreaker is not a medical or therapeutic service. We provide no
          health guarantees. To the fullest extent permitted by law, we shall
          not be liable for any indirect, incidental, or consequential damages
          arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2>7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate accounts that violate
          these terms. You may delete your account at any time by contacting
          us.
        </p>
      </section>

      <section>
        <h2>8. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          Service after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section>
        <h2>9. Governing Law</h2>
        <p>
          These terms are governed by the laws of the European Union and the
          applicable member state where the operator resides.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Questions about these terms? Email us at
          <a href="mailto:quitzzproject&#64;gmail.com">quitzzproject&#64;gmail.com</a>.
        </p>
      </section>
    </div>
  `,
  styles: [`
    .legal-page {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1.5rem 3rem;
      color: rgba(255,255,255,0.85);
      line-height: 1.7;
    }
    h1 { color: #00f2ff; font-size: 1.8rem; margin-bottom: 0.25rem; }
    h2 { color: #ccc; font-size: 1.1rem; margin-top: 1.8rem; }
    .last-updated { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
    ul { padding-left: 1.2rem; }
    li { margin-bottom: 0.4rem; }
    a { color: #00f2ff; }
  `]
})
export class TermsOfService {}
