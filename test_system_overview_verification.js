// test_system_overview_verification.js
const http = require('http');

const API_BASE = 'http://localhost:8080/api';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function post(path, body, token = null) {
  const url = new URL(API_BASE + path);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'POST',
    headers
  }, body);
}

function get(path, token = null) {
  const url = new URL(API_BASE + path);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'GET',
    headers
  });
}

async function runTests() {
  console.log('=== STARTING NEXTGEN ATS SINGLE-ADMIN & SYSTEM OVERVIEW VERIFICATION ===\n');
  const results = {};

  // 1. Authenticate canonical Administrator
  console.log('Step 1: Authenticate Administrator (admin@ai-ats.internal)...');
  const adminLogin = await post('/auth/login', {
    email: 'admin@ai-ats.internal',
    password: 'Password123!'
  });
  if (adminLogin.status !== 200 || !adminLogin.data?.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
  }
  const adminToken = adminLogin.data.data.token;
  console.log('-> Admin logged in successfully: Marcus Vance (admin@ai-ats.internal)\n');

  // 2. Fetch System Overview Stats
  console.log('Step 2: Checking System Overview Stats (/api/admin/stats)...');
  const statsRes = await get('/admin/stats', adminToken);
  const stats = statsRes.data?.data;
  console.log('-> Stats received:', JSON.stringify(stats, null, 2));

  // Validate Single Administrator
  console.log(`\nVerifying Single Administrator count: activeAdmins = ${stats.activeAdmins}, totalAdmins = ${stats.totalAdmins}`);
  if (stats.activeAdmins === 1 && stats.multipleAdminsFlag === false) {
    results['Single Administrator Enforcement'] = 'PASS: Exactly 1 active administrator detected and flag is false';
  } else {
    results['Single Administrator Enforcement'] = `FAIL: activeAdmins=${stats.activeAdmins}, flag=${stats.multipleAdminsFlag}`;
  }

  // 3. Test F & Reserved Admin Name: Attempt to register with reserved admin name "Marcus Vance"
  console.log('\nStep 3: Attempting to register account with reserved name "Marcus Vance"...');
  const reservedNameRes = await post('/auth/register', {
    name: 'Marcus Vance',
    email: `impostor.${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'CANDIDATE'
  });
  console.log('-> Status:', reservedNameRes.status, 'Message:', reservedNameRes.data?.message);
  if (reservedNameRes.status === 400 && reservedNameRes.data?.message?.includes('reserved')) {
    results['Reserved Admin Name Protection'] = 'PASS: Registration with name "Marcus Vance" rejected';
  } else {
    results['Reserved Admin Name Protection'] = `FAIL: Status ${reservedNameRes.status}`;
  }

  // Attempt to self-register as ADMIN
  console.log('\nStep 4: Attempting public registration with role=ADMIN...');
  const adminSelfReg = await post('/auth/register', {
    name: 'Fake Admin',
    email: `fakeadmin.${Date.now()}@test.com`,
    password: 'Password123!',
    role: 'ADMIN'
  });
  console.log('-> Status:', adminSelfReg.status, 'Message:', adminSelfReg.data?.message);
  if (adminSelfReg.status === 400 && adminSelfReg.data?.message?.toLowerCase().includes('admin')) {
    results['Admin Self-Registration Prevention'] = 'PASS: Public role=ADMIN registration rejected';
  } else {
    results['Admin Self-Registration Prevention'] = `FAIL: Status ${adminSelfReg.status}`;
  }

  // Test A: Genuine Candidate Registers
  const candEmail = `genuine.candidate.${Date.now()}@domain.io`;
  console.log(`\nStep 5: Testing Genuine Candidate Registration (${candEmail})...`);
  const candReg = await post('/auth/register', {
    name: 'Elena Rostova',
    email: candEmail,
    password: 'Password123!',
    role: 'CANDIDATE'
  });
  console.log('-> Status:', candReg.status, 'Candidate ID:', candReg.data?.data?.user?.id);
  const candId = candReg.data?.data?.user?.id;
  const candToken = candReg.data?.data?.token;

  // Verify candidate in Admin User Directory
  const usersRes1 = await get('/admin/users?search=' + encodeURIComponent(candEmail), adminToken);
  const foundCand = (usersRes1.data?.data || []).find(u => u.email === candEmail);
  if (foundCand && foundCand.role === 'candidate') {
    results['Test A: Genuine Candidate Persistence & Directory'] = `PASS: Candidate found with ID ${foundCand.id} and role candidate`;
  } else {
    results['Test A: Genuine Candidate Persistence & Directory'] = 'FAIL: Candidate not found in admin directory';
  }

  // Test F: Duplicate Registration Prevention
  console.log('\nStep 6: Testing Duplicate Registration with existing email...');
  const dupReg = await post('/auth/register', {
    name: 'Elena Rostova Duplicate',
    email: candEmail,
    password: 'Password123!',
    role: 'CANDIDATE'
  });
  console.log('-> Status:', dupReg.status, 'Message:', dupReg.data?.message);
  if (dupReg.status === 409) {
    results['Test F: Duplicate Registration Rejection'] = 'PASS: Duplicate registration safely rejected with HTTP 409';
  } else {
    results['Test F: Duplicate Registration Rejection'] = `FAIL: Duplicate returned HTTP ${dupReg.status}`;
  }

  // Test B: Genuine Recruiter Registers
  const recEmail = `genuine.recruiter.${Date.now()}@innovatecorp.com`;
  console.log(`\nStep 7: Testing Genuine Recruiter Registration (${recEmail})...`);
  const recReg = await post('/auth/register', {
    name: 'Sarah Connor',
    email: recEmail,
    password: 'Password123!',
    role: 'RECRUITER',
    companyName: 'InnovateCorp Technologies'
  });
  console.log('-> Status:', recReg.status, 'Recruiter ID:', recReg.data?.data?.user?.id);
  const recId = recReg.data?.data?.user?.id;
  const recToken = recReg.data?.data?.token;

  // Check verification queue
  const queueRes = await get('/admin/recruiters?status=pending', adminToken);
  const foundQueueRec = (queueRes.data?.data || []).find(r => r.recruiterEmail === recEmail);
  if (foundQueueRec && foundQueueRec.verificationStatus === 'pending') {
    results['Test B: Genuine Recruiter Queue Placement'] = `PASS: Recruiter registered with PENDING verification status`;
  } else {
    results['Test B: Genuine Recruiter Queue Placement'] = 'FAIL: Recruiter not found in pending queue';
  }

  // Test C: Unverified Recruiter tries to post a job
  console.log('\nStep 8: Testing Unverified Recruiter Attempting to Post Job...');
  const postJobAttempt = await post('/jobs', {
    title: 'Senior Cloud Engineer',
    description: 'Requires AWS and Kubernetes',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'Full-time'
  }, recToken);
  console.log('-> Status:', postJobAttempt.status, 'Message:', postJobAttempt.data?.message);
  if (postJobAttempt.status === 403) {
    results['Test C: Unverified Job Publishing Block'] = 'PASS: Backend denied job posting with HTTP 403 (Recruiter verification required)';
  } else {
    results['Test C: Unverified Job Publishing Block'] = `FAIL: Status ${postJobAttempt.status}`;
  }

  // Test D: Admin Approves Recruiter
  console.log('\nStep 9: Testing Admin Approval of Recruiter...');
  const approveRes = await post(`/admin/recruiters/${recId}/approve`, {}, adminToken);
  console.log('-> Status:', approveRes.status, 'Approved status:', approveRes.data?.data?.verificationStatus);

  // Check Recruiter Notifications for Approval Message
  const recNotifRes = await get('/notifications', recToken);
  const notifs = recNotifRes.data?.data || [];
  const approvalNotif = notifs.find(n => n.title?.includes('Verified') || n.title?.includes('Approval'));
  console.log('-> Recruiter in-app notification:', approvalNotif ? approvalNotif.title : 'None found');
  if (approveRes.status === 200 && approvalNotif) {
    results['Test D: Recruiter Approval & Notification'] = `PASS: Verified recruiter notified with subject "${approvalNotif.title}"`;
  } else {
    results['Test D: Recruiter Approval & Notification'] = `FAIL: Status ${approveRes.status}, notif: ${!!approvalNotif}`;
  }

  // Test C2: Verified Recruiter can now publish job!
  console.log('\nStep 10: Testing Verified Recruiter Publishing Job...');
  const postJobVerified = await post('/jobs', {
    title: 'Senior Cloud Engineer',
    description: 'Requires AWS and Kubernetes',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'FULL_TIME'
  }, recToken);
  console.log('-> Status:', postJobVerified.status, 'Job ID:', postJobVerified.data?.data?.id);
  if (postJobVerified.status === 200 || postJobVerified.status === 201) {
    results['Test D2: Verified Recruiter Job Publishing'] = `PASS: Job posted successfully after verification`;
  } else {
    results['Test D2: Verified Recruiter Job Publishing'] = `FAIL: Status ${postJobVerified.status}`;
  }

  // Test E: Recruiter 2 for Rejection Test
  const rec2Email = `rejected.recruiter.${Date.now()}@badcompany.com`;
  console.log(`\nStep 11: Registering second recruiter for rejection test (${rec2Email})...`);
  const rec2Reg = await post('/auth/register', {
    name: 'Suspicious Operator',
    email: rec2Email,
    password: 'Password123!',
    role: 'RECRUITER',
    companyName: 'Suspicious Shell LLC'
  });
  const rec2Id = rec2Reg.data?.data?.user?.id;
  const rec2Token = rec2Reg.data?.data?.token;

  console.log('Admin Rejecting Recruiter 2 with reason...');
  const rejectRes = await post(`/admin/recruiters/${rec2Id}/reject`, {
    reason: 'Business tax registration could not be verified with authorities.'
  }, adminToken);
  console.log('-> Status:', rejectRes.status, 'Rejection status:', rejectRes.data?.data?.verificationStatus);

  const rec2Notifs = await get('/notifications', rec2Token);
  const rejNotif = (rec2Notifs.data?.data || []).find(n => n.title?.includes('Verification') || n.title?.includes('Rejected'));
  console.log('-> Rejection notification:', rejNotif ? `${rejNotif.title} - ${rejNotif.message?.slice(0, 50)}...` : 'None');
  if (rejectRes.status === 200 && rejNotif && rejNotif.message?.includes('Business tax registration')) {
    results['Test E: Recruiter Rejection with Reason & Notification'] = 'PASS: Rejection reason persisted and delivered in notification';
  } else {
    results['Test E: Recruiter Rejection with Reason & Notification'] = `FAIL: Status ${rejectRes.status}`;
  }

  // Test G: Verify dashboard calls do not create synthetic users or audit events
  console.log('\nStep 12: Checking idempotent dashboard refreshes...');
  const statsBefore = await get('/admin/stats', adminToken);
  const logsBefore = await get('/admin/activity', adminToken);
  await get('/admin/stats', adminToken);
  await get('/admin/stats', adminToken);
  const statsAfter = await get('/admin/stats', adminToken);
  const logsAfter = await get('/admin/activity', adminToken);
  if (statsBefore.data?.data?.totalUsers === statsAfter.data?.data?.totalUsers &&
      logsBefore.data?.data?.length === logsAfter.data?.data?.length) {
    results['Test G: Idempotent Dashboard Loading'] = 'PASS: Page/API refreshes produce 0 phantom users or events';
  } else {
    results['Test G: Idempotent Dashboard Loading'] = 'FAIL: User or log counts changed on GET request';
  }

  // Test H: Activity Stream reflects real actor, role, target, and timestamp
  console.log('\nStep 13: Inspecting Recent Platform Activity Stream...');
  const latestLogs = logsAfter.data?.data || [];
  console.log('Latest 4 activity logs:');
  latestLogs.slice(0, 4).forEach((l, i) => {
    console.log(`  [${i+1}] Actor: ${l.actorName} (${l.actorRole}) | Action: ${l.action} | Target: ${l.target} | Time: ${l.timestamp}`);
  });
  const hasMarcusAdmin = latestLogs.some(l => l.actorName === 'Marcus Vance' && l.actorRole === 'ADMIN');
  const hasGenericAdmin = latestLogs.some(l => l.actorName === 'Administrator');
  const hasMarcusRecruiter = latestLogs.some(l => l.actorName === 'Marcus Vance' && l.actorRole === 'RECRUITER');

  if (hasMarcusAdmin && !hasGenericAdmin && !hasMarcusRecruiter) {
    results['Test H: Activity Stream Actor Consistency'] = 'PASS: All administrator events attributed to Marcus Vance; no generic "Administrator" or "Marcus Vance" as Recruiter';
  } else {
    results['Test H: Activity Stream Actor Consistency'] = `PARTIAL: hasMarcusAdmin=${hasMarcusAdmin}, hasGenericAdmin=${hasGenericAdmin}, hasMarcusRecruiter=${hasMarcusRecruiter}`;
  }

  // Test I: Unauthorized access prevention
  console.log('\nStep 14: Testing Candidate calling Admin Stats Endpoint...');
  const unauthAttempt = await get('/admin/stats', candToken);
  console.log('-> Status:', unauthAttempt.status);
  if (unauthAttempt.status === 403) {
    results['Test I: Unauthorized Admin Access Prevention'] = 'PASS: Candidate blocked from admin endpoint with HTTP 403';
  } else {
    results['Test I: Unauthorized Admin Access Prevention'] = `FAIL: Status ${unauthAttempt.status}`;
  }

  console.log('\n=================== SUMMARY RESULTS ===================');
  for (const [test, outcome] of Object.entries(results)) {
    console.log(`${test}: ${outcome}`);
  }
  console.log('========================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
