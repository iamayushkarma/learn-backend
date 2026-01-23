# HTTPS & TLS Fundamentals

## What is HTTPS?

**HTTPS = HTTP + TLS/SSL**

HTTPS is HTTP with encryption and security provided by **TLS (Transport Layer Security)**, formerly SSL.

### HTTP (unencrypted)

```
Browser ──────────────────────> Server
     GET /data HTTP/1.1
     Cookie: session=abc123
     ↓
     👁️ Anyone can read this!
```

### HTTPS (encrypted)

```
Browser ──────────────────────> Server
     🔒 Encrypted tunnel (TLS)
     ↓
     👁️ Cannot read without private key
```

---

## Why HTTPS Matters

HTTPS provides three critical security properties:

### 1. Confidentiality (Privacy)

**Problem without HTTPS:**

```
User → [Password: secret123] → 👁️ Attacker sees it → Server
```

**Solution with HTTPS:**

```
User → 🔒[Encrypted data]🔒 → 👁️ Attacker sees gibberish → Server
```

**What it protects:**

- Passwords and credentials
- Personal information
- Credit card numbers
- Session tokens
- API keys
- Private messages
- Browsing history

**Example without HTTPS:**

```
WiFi network at coffee shop:
  ↓
Attacker intercepts:
  POST /login HTTP/1.1
  Content-Type: application/json

  {"username": "alice", "password": "secret123"}
  ↓
Password stolen!
```

**Example with HTTPS:**

```
WiFi network at coffee shop:
  ↓
Attacker intercepts:
  🔒 �ќ9�E�L���B�߲W*�� 🔒
  ↓
Unreadable gibberish
```

---

### 2. Integrity (No Tampering)

**Problem without HTTPS:**

```
User requests: example.com/page
  ↓
👿 Attacker injects: <script>malware()</script>
  ↓
User receives: Modified page with malware
```

**Solution with HTTPS:**

```
User requests: example.com/page
  ↓
👿 Attacker tries to modify
  ↓
TLS detects tampering → Connection failed ❌
```

**What it prevents:**

- Content modification (malware injection)
- Man-in-the-middle (MITM) attacks
- Data corruption
- Response manipulation

**Real-world example:**

- Public WiFi injecting ads into HTTP pages
- ISP modifying HTTP responses
- Government censorship/surveillance
- Attackers redirecting to phishing sites

---

### 3. Authenticity (Trust the Server)

**Problem without HTTPS:**

```
User types: bank.com
  ↓
👿 Attacker redirects to: fake-bank.com
  ↓
User thinks it's real bank ❌
```

**Solution with HTTPS:**

```
User types: bank.com
  ↓
Browser verifies TLS certificate
  ↓
✅ Certificate from trusted CA
✅ Certificate for bank.com
✅ Not expired
  ↓
User knows it's the real bank
```

**What it verifies:**

- Server identity (you're talking to who you think)
- Certificate authority validation
- Domain ownership
- Not a fake/phishing site

**Browser indicators:**

```
🔒 https://bank.com ✅ Secure

⚠️ http://bank.com ❌ Not Secure
```

---

## TLS Handshake (Conceptual)

The TLS handshake establishes a secure connection before any HTTP data is sent.

### Simplified handshake flow

**1. Client Hello**

```
Browser → Server:
  "Hello! I support TLS 1.3, here are my cipher suites:
   - AES-256-GCM
   - ChaCha20-Poly1305
   I can use these for encryption."
```

**2. Server Hello + Certificate**

```
Server → Browser:
  "Hello! Let's use TLS 1.3 with AES-256-GCM.
   Here's my certificate (proves I'm really example.com):
   - Issued to: example.com
   - Issued by: DigiCert (CA)
   - Valid until: 2026-12-31
   - Public key: [public key data]"
```

**3. Browser validates certificate**

```
Browser checks:
  ✅ Is certificate for the correct domain? (example.com)
  ✅ Is it from a trusted CA? (DigiCert in trusted list)
  ✅ Is it not expired?
  ✅ Is the signature valid?

If all pass → Continue
If any fail → Show warning/error
```

**4. Key exchange**

```
Browser → Server:
  🔐 Here's my part of the key (encrypted with your public key)

Browser and Server both generate:
  🔑 Shared encryption keys (symmetric keys)

Both now have the SAME keys for encrypting/decrypting
```

**5. Finished messages**

```
Browser → Server:
  🔒 "Finished" (encrypted with new key)

Server → Browser:
  🔒 "Finished" (encrypted with new key)

Handshake complete! ✅
```

**6. Encrypted HTTP communication**

```
Browser → Server:
  🔒 GET /api/data HTTP/1.1 (encrypted)

Server → Browser:
  🔒 HTTP/1.1 200 OK (encrypted)
```

---

### Key concepts in TLS handshake

#### Asymmetric encryption (public/private key)

- **Public key**: Shared openly, used to encrypt
- **Private key**: Kept secret, used to decrypt

```
Browser encrypts with server's PUBLIC key
  ↓
Only server can decrypt with its PRIVATE key
```

#### Symmetric encryption (shared secret)

- **Same key** for encryption and decryption
- Much faster than asymmetric
- Used for actual data transfer

```
TLS handshake establishes shared symmetric key
  ↓
All HTTP data encrypted/decrypted with this key
```

#### Why both?

1. **Asymmetric** (slow) - Used only during handshake to exchange keys securely
2. **Symmetric** (fast) - Used for all data transfer

---

## Certificates, CA, and Certificate Chain

### What is a certificate?

A digital document that proves a server's identity.

**Certificate contains:**

```
Subject: example.com
Issuer: DigiCert Inc.
Valid from: 2025-01-01
Valid until: 2026-01-01
Public key: [public key data]
Signature: [CA's digital signature]
```

### Certificate Authority (CA)

**Trusted third party that issues certificates.**

**Common CAs:**

- DigiCert
- Let's Encrypt (free)
- GlobalSign
- Sectigo
- GoDaddy

**How it works:**

```
1. example.com generates key pair (public + private)
2. example.com creates certificate request (CSR)
3. example.com sends CSR to CA (DigiCert)
4. CA verifies example.com owns the domain
5. CA signs certificate with its private key
6. example.com installs signed certificate on server
```

### Trust chain (certificate chain)

**Browsers trust root CAs**, which trust intermediate CAs, which sign your certificate.

```
🔒 Root CA (DigiCert Root)
    ↓ (trusted by browser)
🔒 Intermediate CA (DigiCert TLS)
    ↓ (signs)
🔒 Your Certificate (example.com)
```

**Verification flow:**

```
Browser receives example.com certificate
  ↓
Signed by: DigiCert TLS (intermediate)
  ↓
DigiCert TLS signed by: DigiCert Root
  ↓
DigiCert Root is in browser's trusted list ✅
  ↓
Certificate is trusted!
```

**Why chain?**

- **Root CA private keys** kept offline (ultra-secure)
- **Intermediate CAs** do day-to-day signing
- If intermediate compromised → revoke only that, not root

---

### Self-signed certificates

**Certificate signed by yourself (no CA).**

```
example.com creates certificate
example.com signs with own private key
```

**Problem:**

```
Browser: "Who signed this?"
Certificate: "I did"
Browser: "I don't trust you" ❌
```

**Browser warning:**

```
⚠️ Your connection is not private
   NET::ERR_CERT_AUTHORITY_INVALID
```

**Use cases:**

- ✅ Development/testing (localhost)
- ✅ Internal corporate networks
- ❌ Public websites (users see scary warning)

**For production: Always use CA-signed certificates (Let's Encrypt is free!)**

---

### Certificate validation errors

**Common errors and causes:**

**1. Domain mismatch:**

```
Certificate for: example.com
User visiting: www.example.com
❌ NET::ERR_CERT_COMMON_NAME_INVALID
```

**2. Expired certificate:**

```
Valid until: 2024-12-31
Today: 2025-01-15
❌ NET::ERR_CERT_DATE_INVALID
```

**3. Untrusted CA:**

```
Issued by: Unknown CA
❌ NET::ERR_CERT_AUTHORITY_INVALID
```

**4. Revoked certificate:**

```
Certificate was revoked (compromised/lost)
❌ NET::ERR_CERT_REVOKED
```

---

## Mixed Content Problems

**Mixed content** = HTTPS page loading HTTP resources.

### The problem

**HTTPS page with HTTP resources:**

```html
<!-- On https://example.com/page -->
<html>
  <head>
    <script src="http://cdn.com/script.js"></script>
    ❌
  </head>
  <body>
    <img src="http://images.com/photo.jpg" /> ⚠️
  </body>
</html>
```

**Why it's a problem:**

```
HTTPS page (secure) 🔒
  ↓ loads
HTTP resource (insecure) 🔓
  ↓
Attacker can modify the HTTP resource
  ↓
Inject malware into "secure" page
```

---

### Types of mixed content

#### 1. Mixed active content (blocked by default)

**Scripts, stylesheets, iframes, etc.**

```html
<!-- ❌ BLOCKED by modern browsers -->
<script src="http://example.com/script.js"></script>
<link rel="stylesheet" href="http://example.com/style.css" />
<iframe src="http://example.com/widget"></iframe>
```

**Browser console:**

```
🚫 Mixed Content: The page at 'https://example.com' was loaded over HTTPS,
   but requested an insecure script 'http://example.com/script.js'.
   This request has been blocked.
```

**Why blocked:**

- Can execute code
- Can modify page
- High security risk

#### 2. Mixed passive content (warning only)

**Images, audio, video.**

```html
<!-- ⚠️ WARNING but usually allowed -->
<img src="http://example.com/image.jpg" />
<video src="http://example.com/video.mp4"></video>
```

**Browser console:**

```
⚠️ Mixed Content: The page at 'https://example.com' was loaded over HTTPS,
   but requested an insecure image 'http://example.com/image.jpg'.
```

**Why allowed (with warning):**

- Cannot execute code
- Can't modify page
- Lower security risk (but still shows warning)

---

### Fixing mixed content

#### 1. Use HTTPS for all resources

```html
<!-- ✅ GOOD -->
<script src="https://cdn.com/script.js"></script>
<img src="https://images.com/photo.jpg" />
```

#### 2. Use protocol-relative URLs (legacy)

```html
<!-- Inherits protocol from page -->
<script src="//cdn.com/script.js"></script>
```

- On HTTPS page → loads `https://cdn.com/script.js`
- On HTTP page → loads `http://cdn.com/script.js`

**Note:** Protocol-relative URLs are legacy; explicit HTTPS is preferred.

#### 3. Upgrade-Insecure-Requests header

```html
<meta
  http-equiv="Content-Security-Policy"
  content="upgrade-insecure-requests"
/>
```

**Or HTTP header:**

```http
Content-Security-Policy: upgrade-insecure-requests
```

**Browser automatically upgrades HTTP → HTTPS:**

```html
<img src="http://example.com/image.jpg" />
↓ browser converts to
<img src="https://example.com/image.jpg" />
```

---

### Developer tools for finding mixed content

**Chrome DevTools:**

```
1. Open DevTools (F12)
2. Console tab
3. Look for mixed content warnings/errors
4. Fix all HTTP resources
```

**Check all:**

- Images (`<img>`)
- Scripts (`<script>`)
- Stylesheets (`<link>`)
- Fonts (`@font-face`)
- AJAX/fetch requests
- Iframes (`<iframe>`)
- Videos/audio (`<video>`, `<audio>`)

---

## HSTS (HTTP Strict Transport Security)

**Forces browsers to use HTTPS only.**

### What is HSTS?

Server tells browser: "Always use HTTPS for my site, never HTTP."

**Header:**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### How it works

**First visit (HTTP → HTTPS redirect):**

```
1. User types: http://example.com
   ↓
2. Server redirects:
   HTTP/1.1 301 Moved Permanently
   Location: https://example.com
   ↓
3. Browser follows redirect
   ↓
4. Server responds with HSTS header:
   HTTP/1.1 200 OK
   Strict-Transport-Security: max-age=31536000
   ↓
5. Browser remembers: "Only HTTPS for example.com for 1 year"
```

**Future visits:**

```
User types: http://example.com
  ↓
Browser (before sending request):
  "Wait! I remember HSTS. Convert to HTTPS."
  ↓
Browser requests: https://example.com
  ↓
No HTTP request sent! (Prevents MITM attack)
```

---

### HSTS attributes

#### max-age (required)

```http
Strict-Transport-Security: max-age=31536000
```

- Time in seconds to remember HSTS
- `31536000` = 1 year
- `63072000` = 2 years (recommended)

#### includeSubDomains (optional)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- Apply HSTS to all subdomains
- `example.com` → HSTS
- `www.example.com` → HSTS
- `api.example.com` → HSTS
- `anything.example.com` → HSTS

**Be careful:**

- All subdomains MUST support HTTPS
- If any subdomain doesn't have HTTPS → users can't access it

#### preload (optional)

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- Submit domain to browser vendors
- Hardcoded into browser's HSTS preload list
- **HSTS active even on first visit** (ultimate protection)

**Preload requirements:**

1. `max-age` ≥ 31536000 (1 year)
2. `includeSubDomains` must be set
3. Submit at: https://hstspreload.org

**Warning: Hard to undo!**

---

### HSTS benefits

**1. Prevents protocol downgrade attacks:**

```
Attacker tries: http://bank.com (hoping to intercept)
  ↓
Browser: "Nope, HSTS says HTTPS only"
  ↓
Request: https://bank.com (encrypted, safe)
```

**2. No HTTP request sent:**

```
Without HSTS:
  http://bank.com → (insecure request) → 301 redirect → https://bank.com
  ↑ Attacker can intercept this

With HSTS:
  http://bank.com → (browser converts) → https://bank.com
  No insecure request sent!
```

**3. Protects against SSL stripping:**

```
SSL Stripping attack:
  User → http://bank.com
  ↓
  Attacker intercepts 301 redirect
  ↓
  Attacker: "Here's the page over HTTP" (removes HTTPS)
  ↓
  User stays on HTTP (credentials stolen)

With HSTS:
  Browser refuses HTTP, only HTTPS ✅
```

---

### HSTS best practices

**Development:**

```http
Strict-Transport-Security: max-age=300
```

- Short max-age (5 minutes) for testing
- Easy to undo if issues

**Production (recommended):**

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- 2 years max-age
- Include subdomains
- Submit to preload list

**When to use:**

- ✅ All production HTTPS sites
- ✅ Sites handling sensitive data
- ✅ Login/authentication pages
- ⚠️ Be sure ALL content is HTTPS-ready

---

## Quick Security Checklist

### HTTPS essentials

- ✅ Use HTTPS everywhere (never HTTP for production)
- ✅ Get certificate from trusted CA (Let's Encrypt is free)
- ✅ Keep certificates up to date (auto-renewal)
- ✅ Use strong TLS version (TLS 1.2+, prefer TLS 1.3)
- ✅ Use strong cipher suites (AES-256, ChaCha20)

### Headers

- ✅ Set `Strict-Transport-Security` header
- ✅ Set `Content-Security-Policy: upgrade-insecure-requests`
- ✅ Use `Secure` flag on all cookies
- ✅ Use `SameSite` attribute on cookies

### Content

- ✅ Fix all mixed content (no HTTP resources)
- ✅ Use HTTPS for all external resources (CDNs, APIs)
- ✅ Update hardcoded HTTP links to HTTPS
- ✅ Test in browser DevTools for warnings

### Monitoring

- ✅ Monitor certificate expiration
- ✅ Check for mixed content warnings
- ✅ Test with SSL Labs (https://www.ssllabs.com/ssltest/)
- ✅ Monitor security headers (securityheaders.com)

---

## Common Issues and Solutions

### Issue: Certificate expired

**Error:** `NET::ERR_CERT_DATE_INVALID`

**Solution:**

```bash
# Renew certificate (Let's Encrypt example)
certbot renew

# Set up auto-renewal
certbot renew --dry-run
```

### Issue: Mixed content

**Error:** Resources blocked or warnings in console

**Solution:**

```html
<!-- Change all HTTP to HTTPS -->
<script src="https://cdn.com/script.js"></script>

<!-- Or add CSP header -->
<meta
  http-equiv="Content-Security-Policy"
  content="upgrade-insecure-requests"
/>
```

### Issue: HSTS errors on localhost

**Error:** Can't access `http://localhost` during dev

**Solution:**

```
1. Chrome: chrome://net-internals/#hsts
2. Delete domain security policies for localhost
3. Or use different port (http://localhost:3001)
```

### Issue: Self-signed certificate warning

**Error:** `NET::ERR_CERT_AUTHORITY_INVALID`

**Solution (development only):**

```
Option 1: Click "Advanced" → "Proceed to site"
Option 2: Add certificate to trusted store
Option 3: Use mkcert for local dev certificates
```

**Never ignore in production!**
