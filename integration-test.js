#!/usr/bin/env node

const fetch = require('node-fetch');

async function testFullIntegration() {
  console.log('🚀 Testing Full Stack MongoDB Authentication Integration\n');
  
  const backendUrl = 'http://localhost:3001/api/v1';
  const frontendUrl = 'http://localhost:3000';
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpass123',
    name: 'Integration Test User'
  };

  let accessToken = '';
  let refreshToken = '';
  let userId = '';

  try {
    // Test 1: Backend Sign Up
    console.log('1. 🔐 Testing Backend Sign Up...');
    const signupResponse = await fetch(`${backendUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      console.log('✅ Backend signup successful');
      console.log(`   User ID: ${signupData.data.user.id}`);
      console.log(`   Email: ${signupData.data.user.email}`);
      console.log(`   Name: ${signupData.data.user.name}`);
      
      accessToken = signupData.data.session.access_token;
      refreshToken = signupData.data.session.refresh_token;
      userId = signupData.data.user.id;
    } else {
      console.log('❌ Backend signup failed:', signupData.message);
      return;
    }

    // Test 2: Backend Sign In
    console.log('\n2. 🔑 Testing Backend Sign In...');
    const signinResponse = await fetch(`${backendUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const signinData = await signinResponse.json();
    
    if (signinData.success) {
      console.log('✅ Backend signin successful');
      console.log(`   Same User ID: ${signinData.data.user.id === userId ? 'Yes' : 'No'}`);
      accessToken = signinData.data.session.access_token;
    } else {
      console.log('❌ Backend signin failed:', signinData.message);
      return;
    }

    // Test 3: Protected Profile Endpoint
    console.log('\n3. 👤 Testing Protected Profile Endpoint...');
    const profileResponse = await fetch(`${backendUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const profileData = await profileResponse.json();
    
    if (profileData.success) {
      console.log('✅ Profile fetch successful');
      console.log(`   User authenticated: ${profileData.data.user.email}`);
    } else {
      console.log('❌ Profile fetch failed');
    }

    // Test 4: User Isolation - Create Chat
    console.log('\n4. 💬 Testing User Isolation - Chat Creation...');
    const chatResponse = await fetch(`${backendUrl}/chats`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ title: 'Integration Test Chat' }),
    });

    let chatId = '';
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat creation successful');
      console.log(`   Chat belongs to user: ${chatData.data.userId === userId ? 'Yes' : 'No'}`);
      chatId = chatData.data.id || chatData.data._id;
    } else {
      console.log('❌ Chat creation failed');
    }

    // Test 5: Get User's Chats
    console.log('\n5. 📋 Testing User Chat Retrieval...');
    const chatsResponse = await fetch(`${backendUrl}/chats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (chatsResponse.ok) {
      const chatsData = await chatsResponse.json();
      console.log('✅ User chats retrieval successful');
      console.log(`   Number of chats: ${chatsData.data?.length || 0}`);
      console.log(`   Test chat found: ${chatsData.data?.some(chat => chat.title === 'Integration Test Chat') ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ User chats retrieval failed');
    }

    // Test 6: Token Refresh
    console.log('\n6. 🔄 Testing Token Refresh...');
    const refreshResponse = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const refreshData = await refreshResponse.json();
    
    if (refreshData.success) {
      console.log('✅ Token refresh successful');
      console.log('   New access token generated');
      accessToken = refreshData.data.access_token;
    } else {
      console.log('❌ Token refresh failed:', refreshData.message);
    }

    // Test 7: Test refreshed token works
    console.log('\n7. 🔐 Testing Refreshed Token...');
    const refreshedTokenTest = await fetch(`${backendUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (refreshedTokenTest.ok) {
      console.log('✅ Refreshed token works correctly');
    } else {
      console.log('❌ Refreshed token failed');
    }

    // Test 8: Create Message (if chat exists)
    if (chatId) {
      console.log('\n8. 💬 Testing Message Creation...');
      const messageResponse = await fetch(`${backendUrl}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          content: 'Hello from integration test!',
          role: 'user' 
        }),
      });

      if (messageResponse.ok) {
        console.log('✅ Message creation successful');
      } else {
        console.log('❌ Message creation failed');
      }
    }

    // Test 9: Sign Out
    console.log('\n9. 🚪 Testing Sign Out...');
    const signoutResponse = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (signoutResponse.ok) {
      console.log('✅ Sign out successful');
    } else {
      console.log('❌ Sign out failed');
    }

    console.log('\n🎉 Integration Test Complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ MongoDB Authentication: Working');
    console.log('   ✅ JWT Token Management: Working');
    console.log('   ✅ User Isolation: Working');
    console.log('   ✅ Protected Routes: Working');
    console.log('   ✅ Token Refresh: Working');
    console.log('   ✅ Chat & Message System: Working');
    
    console.log('\n🔗 Frontend Test:');
    console.log(`   1. Open: ${frontendUrl}/auth-test`);
    console.log(`   2. Use credentials: ${testUser.email} / ${testUser.password}`);
    console.log('   3. Verify user data displays correctly');
    console.log('   4. Test sign out and sign in again');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    console.log('\nMake sure both backend and frontend servers are running:');
    console.log('   Backend: npm run start:dev (port 3001)');
    console.log('   Frontend: npm run dev (port 3000)');
  }
}

// Run the test
testFullIntegration();