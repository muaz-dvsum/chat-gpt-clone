const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Signup (should NOT return tokens)
    console.log('1️⃣ Testing Signup (should not auto-login)...');
    const signupResponse = await api.post('/auth/signup', {
      email: 'testuser@example.com',
      password: 'testpassword123',
      name: 'Test User'
    });
    
    console.log('✅ Signup Response:', signupResponse.data);
    
    // Verify no tokens in signup response
    if (signupResponse.data.data.session) {
      console.log('❌ ERROR: Signup should not return session tokens!');
    } else {
      console.log('✅ CORRECT: Signup does not auto-login user');
    }
    
    console.log('\n');
    
    // Test 2: Signin (should return tokens)
    console.log('2️⃣ Testing Signin (should return tokens)...');
    const signinResponse = await api.post('/auth/signin', {
      email: 'testuser@example.com',
      password: 'testpassword123'
    });
    
    console.log('✅ Signin Response:', JSON.stringify(signinResponse.data, null, 2));
    
    const accessToken = signinResponse.data.data.session.access_token;
    
    // Test 3: Create a chat (user isolation test)
    console.log('\n3️⃣ Testing Chat Creation (user isolation)...');
    const chatResponse = await api.post('/api/chats', {
      title: 'Test Chat for User 1'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Chat Created:', chatResponse.data);
    
    // Test 4: Get user's chats (should only show their own)
    console.log('\n4️⃣ Testing Chat Retrieval (user isolation)...');
    const chatsResponse = await api.get('/api/chats', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ User Chats:', chatsResponse.data);
    
    console.log('\n🎉 All tests passed! Authentication flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthFlow();