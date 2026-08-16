async function runTests() {
  const BASE_URL = 'http://localhost:8080/api';
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  console.log('Health Status:', healthRes.status, await healthRes.json());

  console.log('\n--- 2. Testing Candidate Login ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@example.com',
      password: 'Password123!'
    })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Token received:', loginData.data?.token ? 'YES (JWT length: ' + loginData.data.token.length + ')' : 'NO');
  console.log('User Role:', loginData.data?.user?.role, 'Name:', loginData.data?.user?.name);
  const token = loginData.data?.token;

  console.log('\n--- 3. Testing Protected /api/auth/me with JWT ---');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Me Status:', meRes.status, await meRes.json());

  console.log('\n--- 4. Testing Recruiter Login ---');
  const recLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'sarah.jenkins@cloudscale.io',
      password: 'Password123!'
    })
  });
  const recLoginData = await recLoginRes.json();
  console.log('Recruiter Login Status:', recLoginRes.status, 'Role:', recLoginData.data?.user?.role);

  console.log('\n--- 5. Testing Admin Login ---');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ai-ats.internal',
      password: 'Password123!'
    })
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('Admin Login Status:', adminLoginRes.status, 'Role:', adminLoginData.data?.user?.role);

  console.log('\n--- 6. Testing New Candidate Registration ---');
  const randomEmail = `candidate.${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Jordan Lee',
      email: randomEmail,
      password: 'StrongPassword123!',
      role: 'candidate'
    })
  });
  const regData = await regRes.json();
  console.log('Registration Status:', regRes.status, 'Created User:', regData.data?.user?.email);

  console.log('\n--- 7. Testing Duplicate Email Prevention ---');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Jordan Lee Duplicate',
      email: randomEmail,
      password: 'StrongPassword123!',
      role: 'candidate'
    })
  });
  console.log('Duplicate Email Status:', dupRes.status, await dupRes.json());

  console.log('\n--- 8. Testing Forgot Password Flow ---');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.rivera@example.com'
    })
  });
  console.log('Forgot Password Status:', forgotRes.status, await forgotRes.json());
}

runTests().catch(console.error);
