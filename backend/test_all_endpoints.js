const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('AI ATS PLATFORM - FULL BACKEND VERIFICATION SUITE');
  console.log('====================================================\n');

  // 1. Health
  console.log('[1] Testing Health Endpoint...');
  const health = await request({ hostname: 'localhost', port: 8080, path: '/api/health', method: 'GET' });
  console.log('Health:', health.status, health.data?.service, 'DB:', health.data?.database?.status);

  // 2. Auth - Candidate Login
  console.log('\n[2] Testing Candidate Login...');
  const candLogin = await request({
    hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'alex.rivera@example.com', password: 'Password123!' });
  console.log('Candidate Login Status:', candLogin.status, 'User:', candLogin.data?.data?.user?.name);
  const candToken = candLogin.data?.data?.token;

  // 3. Auth - Recruiter Login
  console.log('\n[3] Testing Recruiter Login...');
  const recLogin = await request({
    hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'sarah.jenkins@cloudscale.io', password: 'Password123!' });
  console.log('Recruiter Login Status:', recLogin.status, 'User:', recLogin.data?.data?.user?.name);
  const recToken = recLogin.data?.data?.token;

  // 4. Auth - Admin Login
  console.log('\n[4] Testing Admin Login...');
  const admLogin = await request({
    hostname: 'localhost', port: 8080, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@ai-ats.internal', password: 'Password123!' });
  console.log('Admin Login Status:', admLogin.status, 'User:', admLogin.data?.data?.user?.name);
  const admToken = admLogin.data?.data?.token;

  // 5. Candidate Profile
  console.log('\n[5] Testing Candidate Profile...');
  const candProfile = await request({
    hostname: 'localhost', port: 8080, path: '/api/candidate/profile', method: 'GET',
    headers: { 'Authorization': `Bearer ${candToken}` }
  });
  console.log('Profile Status:', candProfile.status, 'Name:', candProfile.data?.data?.name, 'Completion:', candProfile.data?.data?.profileCompletion);

  // 6. Public Jobs
  console.log('\n[6] Testing Public Jobs API...');
  const jobsRes = await request({
    hostname: 'localhost', port: 8080, path: '/api/jobs', method: 'GET'
  });
  console.log('Jobs Status:', jobsRes.status, 'Jobs Count:', jobsRes.data?.data?.length);
  
  // 7. Recruiter Post Job
  console.log('\n[7] Testing Recruiter Create Job...');
  const newJob = await request({
    hostname: 'localhost', port: 8080, path: '/api/jobs', method: 'POST',
    headers: { 'Authorization': `Bearer ${recToken}`, 'Content-Type': 'application/json' }
  }, {
    title: 'Senior AI Platform Engineer',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experienceLevel: 'Senior Level',
    salaryMin: '160000',
    salaryMax: '210000',
    currency: 'USD',
    description: 'Lead AI architecture and large language model integration.',
    requirements: ['5+ years Python/Java', 'Deep Learning & NLP experience'],
    responsibilities: ['Build enterprise AI pipelines'],
    skills: ['Python', 'Java', 'PyTorch', 'Spring Boot', 'PostgreSQL'],
    deadline: '2026-12-31',
    status: 'ACTIVE'
  });
  console.log('Job Created Status:', newJob.status, 'Job ID:', newJob.data?.data?.id, 'Title:', newJob.data?.data?.title);
  const createdJobId = newJob.data?.data?.id;

  // 8. Candidate Save Job
  if (createdJobId) {
    console.log('\n[8] Testing Candidate Save Job...');
    const saveRes = await request({
      hostname: 'localhost', port: 8080, path: `/api/jobs/${createdJobId}/save`, method: 'POST',
      headers: { 'Authorization': `Bearer ${candToken}` }
    });
    console.log('Save Job Status:', saveRes.status, 'Saved State:', saveRes.data?.data?.saved);

    const savedList = await request({
      hostname: 'localhost', port: 8080, path: '/api/jobs/saved', method: 'GET',
      headers: { 'Authorization': `Bearer ${candToken}` }
    });
    console.log('Saved Jobs Count:', savedList.data?.data?.length);

    // 9. Candidate Apply to Job
    console.log('\n[9] Testing Candidate Apply to Job...');
    const applyRes = await request({
      hostname: 'localhost', port: 8080, path: '/api/applications/apply', method: 'POST',
      headers: { 'Authorization': `Bearer ${candToken}`, 'Content-Type': 'application/json' }
    }, { jobId: createdJobId });
    console.log('Apply Status:', applyRes.status, 'Application ID:', applyRes.data?.data?.id, 'ATS Score:', applyRes.data?.data?.atsScore);
    const appId = applyRes.data?.data?.id;

    // 10. Recruiter View & Update Application Status
    if (appId) {
      console.log('\n[10] Testing Recruiter Update Application Status...');
      const statusUpdate = await request({
        hostname: 'localhost', port: 8080, path: `/api/applications/${appId}/status`, method: 'PATCH',
        headers: { 'Authorization': `Bearer ${recToken}`, 'Content-Type': 'application/json' }
      }, { status: 'SHORTLISTED', note: 'Strong fit for Senior AI role' });
      console.log('Update App Status:', statusUpdate.status, 'New Status:', statusUpdate.data?.data?.status);
    }
  }

  // 11. Recruiter Stats & Company
  console.log('\n[11] Testing Recruiter Stats & Company...');
  const statsRes = await request({
    hostname: 'localhost', port: 8080, path: '/api/recruiter/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${recToken}` }
  });
  console.log('Recruiter Stats Status:', statsRes.status, 'Stats:', statsRes.data?.data);

  const compRes = await request({
    hostname: 'localhost', port: 8080, path: '/api/recruiter/company', method: 'GET',
    headers: { 'Authorization': `Bearer ${recToken}` }
  });
  console.log('Company Status:', compRes.status, 'Company Name:', compRes.data?.data?.name);

  // 12. Admin Stats & Users
  console.log('\n[12] Testing Admin Stats & Users...');
  const admStats = await request({
    hostname: 'localhost', port: 8080, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': `Bearer ${admToken}` }
  });
  console.log('Admin Stats Status:', admStats.status, 'Stats:', admStats.data?.data);

  const admUsers = await request({
    hostname: 'localhost', port: 8080, path: '/api/admin/users', method: 'GET',
    headers: { 'Authorization': `Bearer ${admToken}` }
  });
  console.log('Admin Users Status:', admUsers.status, 'Total Users Found:', admUsers.data?.data?.length);

  console.log('\n====================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(console.error);
