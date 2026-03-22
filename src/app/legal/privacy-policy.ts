import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  template: `
    <div class="legal-page">
      <h1>Privacy Policy</h1>
      <p class="last-updated">Last updated: March 22, 2026</p>

      <section>
        <h2>1. Who We Are</h2>
        <p>
          Unbreaker ("we", "us", "our") operates the website
          <strong>unbreaker.app</strong>. This privacy policy explains how we
          collect, use, and protect your personal data in compliance with the
          EU General Data Protection Regulation (GDPR) and other applicable
          laws.
        </p>
      </section>

      <section>
        <h2>2. Data We Collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address, username, and hashed password when you register.</li>
          <li><strong>Usage data:</strong> events you log (commits, urges, relapses), group membership, messages, and challenge participation.</li>
          <li><strong>Technical data:</strong> IP address, browser type, and access timestamps collected automatically via server logs.</li>
          <li><strong>Feedback data:</strong> any text you submit through the feedback form.</li>
        </ul>
      </section>

      <section>
        <h2>3. Legal Basis for Processing</h2>
        <p>We process your data based on:</p>
        <ul>
          <li><strong>Contract performance</strong> (Art. 6(1)(b) GDPR) — to provide our service.</li>
          <li><strong>Legitimate interest</strong> (Art. 6(1)(f) GDPR) — for security, fraud prevention, and service improvement.</li>
          <li><strong>Consent</strong> (Art. 6(1)(a) GDPR) — where explicitly given (e.g., optional feedback).</li>
        </ul>
      </section>

      <section>
        <h2>4. How We Use Your Data</h2>
        <ul>
          <li>To operate and maintain your account and the core app features.</li>
          <li>To compute progress scores, streaks, and group interactions.</li>
          <li>To send transactional emails (e.g., password reset).</li>
          <li>To improve our service based on aggregated, anonymised analytics.</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Sharing</h2>
        <p>
          We do not sell your personal data. We share data only with:
        </p>
        <ul>
          <li><strong>Resend</strong> — for transactional email delivery.</li>
          <li><strong>Hosting providers</strong> — to serve the application.</li>
        </ul>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. You may
          request deletion of your account and associated data at any time by
          contacting us.
        </p>
      </section>

      <section>
        <h2>7. Your Rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Rectify inaccurate data.</li>
          <li>Erase your data ("right to be forgotten").</li>
          <li>Restrict or object to processing.</li>
          <li>Data portability.</li>
          <li>Lodge a complaint with a supervisory authority.</li>
        </ul>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          We use only essential cookies and local storage required for
          authentication (JWT token). We do not use tracking or advertising
          cookies.
        </p>
      </section>

      <section>
        <h2>9. Security</h2>
        <p>
          Passwords are hashed with bcrypt. All traffic is served over HTTPS.
          We apply rate limiting and other standard security measures.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          For any privacy-related questions or requests, email us at
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
export class PrivacyPolicy {}
