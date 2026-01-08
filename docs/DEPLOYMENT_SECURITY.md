# Deployment Security Checklist

This document provides a comprehensive security checklist for deploying Solventless to production environments.

## Pre-Deployment Checklist

### 1. Environment Configuration ✓

#### Firebase Configuration
- [ ] Firebase project created in production mode
- [ ] Firebase Functions deployed with secrets configured
- [ ] API_KEY secret set: `firebase functions:secrets:set API_KEY`
- [ ] STRIPE_SECRET_KEY secret set: `firebase functions:secrets:set STRIPE_SECRET_KEY`
- [ ] Firebase Hosting configured with security headers (see firebase.json)
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS certificate verified

#### Google Cloud Configuration
- [ ] Gemini API key restricted to Firebase Function IP ranges
- [ ] API key usage limits configured
- [ ] Billing alerts set up (recommended: $50, $100, $200)
- [ ] Usage quotas configured for cost control

#### Stripe Configuration
- [ ] Production Stripe account created
- [ ] Webhook endpoints configured
- [ ] Webhook signing secrets stored securely
- [ ] Payment success/cancel URLs configured
- [ ] Product/pricing configured correctly

### 2. Code Security ✓

- [x] All console.log statements removed from production builds (terser configured)
- [x] Input validation implemented for all user inputs
- [x] Error boundaries implemented for React components
- [x] Capacitor dependencies version-matched (all v7.x)
- [x] npm audit shows 0 vulnerabilities
- [ ] TypeScript strict mode enabled (optional improvement)
- [ ] All TODO/FIXME comments resolved

### 3. Security Headers ✓

Verify all headers are configured in `firebase.json`:
- [x] Content-Security-Policy (CSP)
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy (camera, microphone, geolocation disabled)

### 4. Data Protection ✓

- [x] Local-first storage implemented (SQLite/localStorage)
- [x] No sensitive data sent to backend (only calculations)
- [x] Data validation on load from storage
- [x] Privacy Policy displayed in app
- [x] Terms of Use displayed in app

### 5. Testing Requirements

#### Security Testing
- [ ] OWASP ZAP automated security scan completed
- [ ] Manual XSS testing on all input fields
- [ ] SQL injection testing on SQLite queries
- [ ] Authentication bypass testing for Pro features
- [ ] Rate limiting testing on Cloud Functions

#### Functional Testing
- [ ] Web platform tested in Chrome, Firefox, Safari
- [ ] iOS app tested on physical device
- [ ] Android app tested on physical device
- [ ] Payment flow tested (success and cancel scenarios)
- [ ] AI insight generation tested
- [ ] Data export functionality tested
- [ ] Offline mode tested

#### Performance Testing
- [ ] Load testing on Cloud Functions (recommended: 100 concurrent users)
- [ ] Mobile performance tested with 1000+ transactions
- [ ] Network throttling tested (3G/4G conditions)
- [ ] Memory leak testing

### 6. Mobile App Store Preparation

#### iOS App Store
- [ ] Apple Developer account active
- [ ] App ID registered with Bundle ID: `com.Solventless.finance`
- [ ] In-App Purchase configured in App Store Connect
- [ ] RevenueCat iOS API key configured in `paymentService.ts`
- [ ] Privacy Policy URL provided
- [ ] App Review notes prepared
- [ ] Screenshots prepared (all required sizes)
- [ ] App icon finalized (1024x1024)

#### Google Play Store
- [ ] Google Play Developer account active
- [ ] App Bundle signed with production keystore
- [ ] RevenueCat Android API key configured
- [ ] Privacy Policy URL provided
- [ ] Data Safety form completed
- [ ] Screenshots prepared (all required sizes)
- [ ] Feature graphic prepared

### 7. Monitoring & Alerting

- [ ] Firebase Analytics configured (optional)
- [ ] Cloud Function error alerting set up
- [ ] API usage monitoring dashboard created
- [ ] Stripe payment monitoring configured
- [ ] User feedback mechanism implemented

## Deployment Commands

### Web Deployment (Firebase Hosting)

```bash
# 1. Build the application
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# 3. Deploy Cloud Functions
firebase deploy --only functions
```

### iOS Deployment

```bash
# 1. Build web assets
npm run build

# 2. Sync to iOS
npx cap sync ios

# 3. Open Xcode
npx cap open ios

# 4. In Xcode:
#    - Select "Any iOS Device" or "Generic iOS Device"
#    - Product → Archive
#    - Distribute App → App Store Connect → Upload
```

### Android Deployment

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. In Android Studio:
#    - Build → Generate Signed Bundle/APK
#    - Select Android App Bundle
#    - Use production keystore
#    - Upload .aab to Google Play Console
```

## Post-Deployment Verification

### Immediate Checks (within 1 hour)
- [ ] Website loads correctly on production URL
- [ ] SSL certificate shows valid in browser
- [ ] Security headers visible in browser DevTools (Network tab)
- [ ] API endpoints respond correctly (test AI insight generation)
- [ ] Payment flow works (test with Stripe test card)
- [ ] No console errors in production build

### 24-Hour Checks
- [ ] Monitor Cloud Function invocations (Firebase Console)
- [ ] Check for any error logs
- [ ] Verify API usage within expected limits
- [ ] Monitor Stripe payment dashboard

### 7-Day Checks
- [ ] Review user feedback
- [ ] Analyze usage patterns
- [ ] Check for any security incidents
- [ ] Review API costs and adjust limits if needed

## Incident Response Plan

### Security Incident Detected

1. **Assess Severity**
   - Critical: API key compromised, data breach
   - High: XSS vulnerability, authentication bypass
   - Medium: DoS, minor information disclosure
   - Low: UI bugs, non-security issues

2. **Immediate Actions (Critical/High)**
   - Disable affected feature via Firebase (if possible)
   - Revoke compromised keys immediately
   - Notify affected users within 72 hours (GDPR requirement)
   - Document incident timeline

3. **Remediation**
   - Deploy hotfix within 24 hours for critical issues
   - Test fix thoroughly before deployment
   - Update documentation
   - Conduct post-mortem review

4. **Communication**
   - Internal: Notify team via Slack/email
   - External: In-app message or email to users
   - Public: Security advisory if data breach

### API Key Compromised

```bash
# 1. Revoke old key in Google Cloud Console
# 2. Generate new key
# 3. Update Firebase secret
firebase functions:secrets:set API_KEY

# 4. Redeploy functions
firebase deploy --only functions

# 5. Monitor usage for unauthorized charges
```

## Maintenance Schedule

### Weekly
- Review error logs
- Check API usage and costs
- Monitor user feedback

### Monthly
- Review security headers configuration
- Update dependencies: `npm audit` and `npm update`
- Review Firebase usage and optimize costs
- Test backup/restore procedures

### Quarterly
- Full security audit
- Penetration testing
- Review and update privacy policy if needed
- Review Terms of Use

### Annually
- Renew SSL certificates (auto-renewed by Firebase)
- Review all third-party service agreements
- Update app store metadata
- Comprehensive code review

## Security Contacts

- **Firebase Support:** https://firebase.google.com/support
- **Stripe Support:** https://support.stripe.com
- **RevenueCat Support:** https://www.revenuecat.com/support
- **Google Cloud Security:** https://cloud.google.com/security

## Compliance Requirements

### GDPR (EU Users)
- [x] Privacy Policy implemented
- [x] Local-first data storage (minimal server data)
- [ ] Data export functionality (CSV/PDF)
- [ ] Account deletion functionality
- [ ] Data processing agreement with Stripe/RevenueCat

### CCPA (California Users)
- [x] Privacy Policy includes data collection disclosure
- [ ] "Do Not Sell My Information" option (if applicable)

### PCI DSS (Payment Processing)
- [x] No credit card data stored locally
- [x] Stripe handles all payment processing (PCI compliant)
- [x] No payment data sent to application backend

## Additional Hardening (Optional)

### Rate Limiting
Add rate limiting to Cloud Functions:

```typescript
// functions/src/index.ts
import * as rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to functions
export const generateFinancialInsight = onRequest(
  { secrets: ["API_KEY"] },
  (request, response) => {
    limiter(request, response, () => {
      // ... existing code
    });
  }
);
```

### Biometric Authentication
Add face/fingerprint authentication for Pro features:

```bash
npm install @capacitor/biometric
```

### End-to-End Encryption
For future cloud sync feature, implement E2E encryption:
- Use device-generated keypair
- Encrypt data before uploading
- Store keys in device Keychain/Keystore

---

**Last Updated:** December 17, 2025  
**Next Review:** Before production deployment  
**Document Owner:** Engineering Team

