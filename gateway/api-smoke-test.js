// Simple API smoke test script for your NestJS backend
// Usage: node api-smoke-test.js

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000'; // Change if your server runs on a different port

async function runUserFlow() {
  let accessToken = '';
  let userId = '';
  let documentId = '';
  let ingestionId = '';

  // 1. Register
  try {
    console.log('Registering user...');
    await axios.post(`${BASE_URL}/auth/register`, {
      username: 'apitestuser',
      email: 'apitestuser@example.com',
      password: 'apitestpass123',
    });
    console.log('✔ Register: Success');
  } catch (err) {
    if (err.response && err.response.status === 409) {
      console.log('✔ Register: User already exists');
    } else {
      console.error('✖ Register:', err.message);
      return;
    }
  }

  // 2. Login
  try {
    console.log('Logging in...');
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'apitestuser',
      password: 'apitestpass123',
    });
    accessToken = res.data.accessToken;
    console.log('✔ Login: Success');
  } catch (err) {
    console.error('✖ Login:', err.message);
    return;
  }

  // 3. Get current user info
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    userId = res.data.userId;
    console.log('✔ Auth Me: Success');
  } catch (err) {
    console.error('✖ Auth Me:', err.message);
  }

  // 4. List users (should fail if not admin)
  try {
    await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Users List: Success (should be admin)');
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log('✔ Users List: Forbidden (expected for non-admin)');
    } else {
      console.error('✖ Users List:', err.message);
    }
  }

  // 5. Upload a document (should fail if not admin/editor)
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('title', 'API Test Document');
    form.append('description', 'Test upload');
    form.append('file', fs.createReadStream(__filename), 'test.txt');
    const res = await axios.post(`${BASE_URL}/documents`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });
    documentId = res.data.id;
    console.log('✔ Document Upload: Success');
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log('✔ Document Upload: Forbidden (expected for non-admin/editor)');
    } else {
      console.error('✖ Document Upload:', err.message);
    }
  }

  // 6. List documents
  try {
    await axios.get(`${BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Documents List: Success');
  } catch (err) {
    console.error('✖ Documents List:', err.message);
  }

  // 7. Trigger ingestion (should fail if not admin/editor)
  try {
    if (documentId) {
      const res = await axios.post(`${BASE_URL}/ingestion/trigger`, {
        documentId,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      ingestionId = res.data.ingestionId;
      console.log('✔ Ingestion Trigger: Success');
    } else {
      console.log('Skipping ingestion trigger: No documentId');
    }
  } catch (err) {
    if (err.response && err.response.status === 403) {
      console.log('✔ Ingestion Trigger: Forbidden (expected for non-admin/editor)');
    } else {
      console.error('✖ Ingestion Trigger:', err.message);
    }
  }

  // 8. List ingestions
  try {
    await axios.get(`${BASE_URL}/ingestion`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Ingestion List: Success');
  } catch (err) {
    console.error('✖ Ingestion List:', err.message);
  }

  // 9. Logout
  try {
    await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Logout: Success');
  } catch (err) {
    console.error('✖ Logout:', err.message);
  }
}

async function runAdminFlow() {
  let accessToken = '';
  let userId = '';
  let documentId = '';
  let ingestionId = '';

  // 1. Login as admin
  try {
    console.log('\nLogging in as admin...');
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123',
    });
    accessToken = res.data.accessToken;
    console.log('✔ Admin Login: Success');
  } catch (err) {
    console.error('✖ Admin Login:', err.message);
    return;
  }

  // 2. List users (should succeed)
  try {
    await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Admin Users List: Success');
  } catch (err) {
    console.error('✖ Admin Users List:', err.message);
  }

  // 3. Upload a document (should succeed)
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('title', 'Admin API Test Document');
    form.append('description', 'Admin test upload');
    form.append('file', fs.createReadStream(__filename), 'test.txt');
    const res = await axios.post(`${BASE_URL}/documents`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
    });
    documentId = res.data.id;
    console.log('✔ Admin Document Upload: Success');
  } catch (err) {
    console.error('✖ Admin Document Upload:', err.message);
  }

  // 4. Trigger ingestion (should succeed)
  try {
    if (documentId) {
      const res = await axios.post(`${BASE_URL}/ingestion/trigger`, {
        documentId,
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      ingestionId = res.data.ingestionId;
      console.log('✔ Admin Ingestion Trigger: Success');
    } else {
      console.log('Skipping admin ingestion trigger: No documentId');
    }
  } catch (err) {
    console.error('✖ Admin Ingestion Trigger:', err);
  }

  // 5. Poll for ingestion completion and retrieve embeddings
  if (ingestionId) {
    let status = 'processing';
    let attempts = 0;
    const maxAttempts = 10;
    while (status === 'processing' && attempts < maxAttempts) {
      await new Promise(res => setTimeout(res, 2000));
      try {
        const res = await axios.get(`${BASE_URL}/ingestion/${ingestionId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } });
        status = res.data.status;
        console.log(`Ingestion status: ${status}`);
      } catch (err) {
        console.error('✖ Error checking ingestion status:', err.message);
        break;
      }
      attempts++;
    }
    if (status === 'completed') {
      try {
        const res = await axios.get(`${BASE_URL}/ingestion/${ingestionId}/embeddings`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log('✔ Embedding Retrieval: Success', res.data);
      } catch (err) {
        console.error('✖ Embedding Retrieval:', err.message);
      }
    } else {
      console.log('✖ Ingestion did not complete in time, skipping embedding retrieval.');
    }
  }

  // 6. List ingestions
  try {
    await axios.get(`${BASE_URL}/ingestion`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Admin Ingestion List: Success');
  } catch (err) {
    console.error('✖ Admin Ingestion List:', err.message);
  }

  // 7. Logout
  try {
    await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✔ Admin Logout: Success');
  } catch (err) {
    console.error('✖ Admin Logout:', err.message);
  }
}

(async () => {
  console.log('--- Testing as normal user ---');
  await runUserFlow();
  console.log('\n--- Testing as admin user ---');
  await runAdminFlow();
})();
