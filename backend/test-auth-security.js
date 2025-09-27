#!/usr/bin/env node

const fetch = require('node-fetch');

async function testMongoAuth() {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  console.log('🔐 Testing MongoDB Authentication Issues\n');
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'correctpassword123',
    name: 'Test User'
  };

  try {
    // Test 1: Sign Up
    console.log('1. Testing Sign Up...');
    const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const signupData = await signupResponse.json();
    console.log('Signup response:', JSON.stringify(signupData, null, 2));
    
    if (!signupData.success) {
      console.log('❌ Signup failed:', signupData.message);
      return;
    }
    
    console.log('✅ Signup successful');
    const accessToken = signupData.data.session.access_token;
    const userId = signupData.data.user.id;

    // Test 2: Try to sign in with WRONG password
    console.log('\n2. Testing Sign In with WRONG password...');
    const wrongPasswordResponse = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword123', // Wrong password
      }),
    });

    const wrongPasswordData = await wrongPasswordResponse.json();
    console.log('Wrong password response:', JSON.stringify(wrongPasswordData, null, 2));
    
    if (wrongPasswordData.success) {
      console.log('❌ SECURITY ISSUE: Wrong password was accepted!');
    } else {
      console.log('✅ Correct: Wrong password was rejected');
    }

    // Test 3: Sign in with CORRECT password
    console.log('\n3. Testing Sign In with CORRECT password...');
    const correctPasswordResponse = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password, // Correct password
      }),
    });

    const correctPasswordData = await correctPasswordResponse.json();
    console.log('Correct password response:', JSON.stringify(correctPasswordData, null, 2));
    
    if (correctPasswordData.success) {
      console.log('✅ Correct password was accepted');
    } else {
      console.log('❌ ISSUE: Correct password was rejected!');
      return;
    }

    // Test 4: Test JWT Token Validation
    console.log('\n4. Testing JWT Token Validation...');
    const profileResponse = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const profileData = await profileResponse.json();
    console.log('Profile response:', JSON.stringify(profileData, null, 2));
    
    if (profileData.success) {
      console.log('✅ JWT token validation working');
    } else {
      console.log('❌ JWT token validation failed');
    }

    // Test 5: Test Chat Isolation - Create Chat
    console.log('\n5. Testing Chat Creation...');
    const chatResponse = await fetch(`${baseUrl}/chats`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ title: 'My Test Chat' }),
    });

    let chatData;
    if (chatResponse.ok) {
      chatData = await chatResponse.json();
      console.log('Chat creation response:', JSON.stringify(chatData, null, 2));
      console.log('✅ Chat creation successful');
      console.log(`Chat userId: ${chatData.data.userId}`);
      console.log(`Logged in userId: ${userId}`);
      console.log(`User isolation working: ${chatData.data.userId.toString() === userId.toString() ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Chat creation failed');
      console.log('Status:', chatResponse.status);
      console.log('Error:', await chatResponse.text());
    }

    // Test 6: Get User's Chats (Check Isolation)
    console.log('\n6. Testing Chat Retrieval (User Isolation)...');
    const chatsResponse = await fetch(`${baseUrl}/chats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (chatsResponse.ok) {
      const chatsData = await chatsResponse.json();
      console.log('User chats response:', JSON.stringify(chatsData, null, 2));
      console.log('✅ Chat retrieval successful');
      console.log(`Number of chats: ${chatsData.data?.length || 0}`);
      
      if (chatsData.data && chatsData.data.length > 0) {
        const allChatsHaveCorrectUserId = chatsData.data.every(chat => 
          chat.userId.toString() === userId.toString()
        );
        console.log(`All chats belong to user: ${allChatsHaveCorrectUserId ? 'Yes' : 'No'}`);
      }
    } else {
      console.log('❌ Chat retrieval failed');
    }

    // Test 7: Debug endpoint
    console.log('\n7. Testing Debug Endpoint...');
    const debugResponse = await fetch(`${baseUrl}/debug/user-info`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('Debug response:', JSON.stringify(debugData, null, 2));
    } else {
      console.log('Debug endpoint failed:', debugResponse.status);
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Check if password hashing is working (wrong passwords should be rejected)');
    console.log('✅ Check if JWT tokens are properly validated');
    console.log('✅ Check if user isolation is working (users only see their own chats)');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testMongoAuth();