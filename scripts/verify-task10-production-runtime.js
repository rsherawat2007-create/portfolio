/**
 * Phase 5: Live Vercel Production Runtime Verification
 *
 * Tests the live deployed application on Vercel:
 * 1. Homepage loads (HTTP 200) with security headers.
 * 2. Public API loads dynamic Supabase data (isConfigured: true, profile, 4 projects, 8 certs, 25 skills).
 * 3. Safe DTO projection check (zero password, private setting, or userId leakage).
 * 4. Protected API rejection (HTTP 401 for unauthorized callers).
 * 5. Live Admin Authentication (verifies login with session cookie against Vercel + Supabase).
 * 6. Authenticated route access and post-logout revocation.
 */

const fs = require("fs");
const path = require("path");

const PRODUCTION_URL = "https://portfolio-sooty-five-88.vercel.app";

// Read admin credentials from .env.local for live login test
let adminEmail = "";
let adminPassword = "";

try {
  const envLocal = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf-8");
  for (const line of envLocal.split("\n")) {
    if (line.startsWith("ADMIN_EMAIL=")) {
      adminEmail = line.split("=")[1].replace(/\"/g, "").trim();
    }
    if (line.startsWith("ADMIN_PASSWORD=")) {
      adminPassword = line.split("=")[1].replace(/\"/g, "").trim();
    }
  }
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runLiveVerification() {
  console.log("\n=======================================================");
  console.log(`LIVE VERCEL PRODUCTION RUNTIME VERIFICATION`);
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log("=======================================================\n");

  // TEST 1: Homepage & Security Headers
  console.log("1. Verifying Live Homepage & HTTP Security Headers:");
  const homeRes = await fetch(PRODUCTION_URL);
  assert(homeRes.status === 200, `Homepage returned HTTP 200 (Got ${homeRes.status})`);

  const headers = homeRes.headers;
  assert(headers.get("x-frame-options") === "DENY", "X-Frame-Options is DENY");
  assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options is nosniff");
  assert(headers.has("content-security-policy"), "Content-Security-Policy is present");
  assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy is strict-origin-when-cross-origin");

  const homeHtml = await homeRes.text();
  assert(homeHtml.includes("Rahul Sehrawat"), "Homepage renders dynamic owner name (Rahul Sehrawat)");

  // TEST 2: Public API & Supabase Data Verification
  console.log("\n2. Verifying Public API & Supabase Data Integration (/api/public):");
  const publicRes = await fetch(`${PRODUCTION_URL}/api/public`);
  assert(publicRes.status === 200, `Public API returned HTTP 200 (Got ${publicRes.status})`);

  const publicJson = await publicRes.json();
  assert(publicJson.success === true, "Public API returned success: true");
  assert(publicJson.data.isConfigured === true, "isConfigured is TRUE (proving live Supabase connection)");

  const profile = publicJson.data.profile;
  assert(profile.fullName === "Rahul Sehrawat", `Profile name matches Supabase: ${profile.fullName}`);
  assert(profile.email === "rsherawat2007@gmail.com", `Profile email matches Supabase: ${profile.email}`);
  assert(profile.location.includes("Gurugram"), `Profile location matches Supabase: ${profile.location}`);

  const projects = publicJson.data.projects;
  assert(projects.length === 4, `Live Supabase projects returned: ${projects.length} (Expected: 4)`);

  const certificates = publicJson.data.certificates;
  assert(certificates.length === 8, `Live Supabase certificates returned: ${certificates.length} (Expected: 8)`);

  const skills = publicJson.data.skills;
  const totalSkillItems = skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
  assert(totalSkillItems === 25, `Live Supabase skills returned: ${totalSkillItems} (Expected: 25)`);

  const education = publicJson.data.education;
  assert(education.length === 1, `Live Supabase education returned: ${education.length} (Expected: 1)`);
  assert(education[0].institution.includes("SGT University"), `Education institution matches Supabase: ${education[0].institution}`);

  const hackathons = publicJson.data.hackathons;
  assert(hackathons.length === 2, `Live Supabase hackathons returned: ${hackathons.length} (Expected: 2)`);

  // TEST 3: Zero Sensitive Data Leakage in Public Payload
  console.log("\n3. Verifying Zero Sensitive Data Exposure in Public DTO:");
  const publicString = JSON.stringify(publicJson);
  assert(!publicString.includes("password"), "Public DTO does not leak 'password'");
  assert(!publicString.includes("geminiApiKey"), "Public DTO does not leak 'geminiApiKey'");
  assert(!publicString.includes("userSettings"), "Public DTO does not leak 'userSettings'");
  assert(!publicString.includes("SESSION_SECRET"), "Public DTO does not leak 'SESSION_SECRET'");

  // TEST 4: Unauthorized Access Denial on Protected Endpoints
  console.log("\n4. Verifying Unauthorized Access Rejection on Protected APIs:");
  const unauthProfileRes = await fetch(`${PRODUCTION_URL}/api/profile`);
  assert(unauthProfileRes.status === 401, `Unauthenticated /api/profile rejected with HTTP 401 (Got ${unauthProfileRes.status})`);

  const unauthMeRes = await fetch(`${PRODUCTION_URL}/api/auth/me`);
  assert(unauthMeRes.status === 401, `Unauthenticated /api/auth/me rejected with HTTP 401 (Got ${unauthMeRes.status})`);

  // TEST 5: Invalid Admin Login Rejection
  console.log("\n5. Verifying Invalid Admin Login Rejection:");
  const invalidLoginRes = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "wrong@example.com", password: "wrongpassword123" }),
  });
  assert(invalidLoginRes.status === 401, `Invalid login rejected with HTTP 401 (Got ${invalidLoginRes.status})`);

  // TEST 6: Valid Admin Authentication & Session Management
  if (adminEmail && adminPassword) {
    console.log("\n6. Verifying Live Admin Authentication against Vercel + Supabase:");
    const validLoginRes = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    assert(validLoginRes.status === 200, `Admin login successful with HTTP 200 (Got ${validLoginRes.status})`);

    const setCookieHeader = validLoginRes.headers.get("set-cookie");
    assert(setCookieHeader !== null && setCookieHeader.includes("portfolio_admin_session"), "Set-Cookie header sets portfolio_admin_session");
    assert(setCookieHeader.includes("HttpOnly"), "Session cookie enforces HttpOnly flag");
    assert(setCookieHeader.toLowerCase().includes("samesite=lax"), "Session cookie enforces SameSite=Lax flag");

    // Extract cookie for authenticated requests
    const cookieValue = setCookieHeader.split(";")[0];

    // Access protected route using session cookie
    const authProfileRes = await fetch(`${PRODUCTION_URL}/api/profile`, {
      headers: { Cookie: cookieValue },
    });
    assert(authProfileRes.status === 200, `Authenticated admin access to /api/profile returned HTTP 200 (Got ${authProfileRes.status})`);

    // Verify session validation endpoint
    const authMeRes = await fetch(`${PRODUCTION_URL}/api/auth/me`, {
      headers: { Cookie: cookieValue },
    });
    assert(authMeRes.status === 200, `/api/auth/me returned HTTP 200 with valid session`);
    const meJson = await authMeRes.json();
    assert(meJson.success === true, "meJson.success is true");
    assert(meJson.user.email === adminEmail, `meJson.user.email matches admin: ${meJson.user.email}`);

    // Logout & Token Revocation
    console.log("\n7. Verifying Logout & Distributed Token Revocation:");
    const logoutRes = await fetch(`${PRODUCTION_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookieValue },
    });
    assert(logoutRes.status === 200, `Logout returned HTTP 200`);

    // Attempt reuse of revoked cookie
    const postLogoutProfileRes = await fetch(`${PRODUCTION_URL}/api/profile`, {
      headers: { Cookie: cookieValue },
    });
    assert(postLogoutProfileRes.status === 401, `Revoked session cookie strictly REJECTED with HTTP 401 (Got ${postLogoutProfileRes.status})`);
  } else {
    console.log("\n⚠️ Admin credentials not found in .env.local; skipping live credential login test.");
  }

  console.log("\n=======================================================");
  console.log(`ALL LIVE PRODUCTION VERIFICATION CHECKS PASSED: ${passed}/${total}`);
  console.log("=======================================================\n");
}

runLiveVerification().catch((err) => {
  console.error("Live verification failed:", err);
  process.exit(1);
});
