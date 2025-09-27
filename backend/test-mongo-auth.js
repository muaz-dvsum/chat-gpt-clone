const fetch = require('node-fetch');

async function testMongoAuth() {
  const baseUrl = 'http://localhost:3001/api/v1';
  
  console.log('Testing MongoDB Authentication Flow...\n');
  
  const testEmail = 'testuser@example.com';
  const testPassword = 'testpass123';
  const testName = 'Test User';
  
  try {
    // Test 1: Sign Up
    console.log('1. Testing Sign Up...');
    const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName
      }),
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup response:', JSON.stringify(signupData, null, 2));
    
    if (!signupData.success) {
      console.log('❌ Signup failed:', signupData.message);
      // Try signin instead (user might already exist)
    } else {
      console.log('✅ Signup successful');
      console.log('User ID:', signupData.data.user.id);
      console.log('Access Token:', signupData.data.session.access_token.substring(0, 20) + '...');
    }
    
    // Test 2: Sign In
    console.log('\n2. Testing Sign In...');
    const signinResponse = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const signinData = await signinResponse.json();
    console.log('Signin response:', JSON.stringify(signinData, null, 2));
    
    if (!signinData.success) {
      console.log('❌ Signin failed:', signinData.message);
      return;
    }
    
    console.log('✅ Signin successful');
    console.log('User ID:', signinData.data.user.id);
    const accessToken = signinData.data.session.access_token;
    const refreshToken = signinData.data.session.refresh_token;
    
    // Test 3: Get Profile with JWT Token
    console.log('\n3. Testing Get Profile...');
    const profileResponse = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('Profile response:', JSON.stringify(profileData, null, 2));
      console.log('✅ Profile fetch successful');
    } else {
      console.log('❌ Profile fetch failed');
      console.log('Status:', profileResponse.status);
      console.log('Error:', await profileResponse.text());
    }
    
    // Test 4: Test Refresh Token
    console.log('\n4. Testing Refresh Token...');
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
    
    const refreshData = await refreshResponse.json();
    
    if (refreshData.success) {
      console.log('✅ Token refresh successful');
      console.log('New Access Token:', refreshData.data.access_token.substring(0, 20) + '...');
    } else {
      console.log('❌ Token refresh failed:', refreshData.message);
    }
    
    // Test 5: Test Chat Creation (User Isolation)
    console.log('\n5. Testing Chat Creation (User Isolation)...');
    const chatResponse = await fetch(`${baseUrl}/chats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Chat',
      }),
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('Chat creation response:', JSON.stringify(chatData, null, 2));
      console.log('✅ Chat creation successful');
      console.log('Chat belongs to user:', chatData.data.userId);
    } else {
      console.log('❌ Chat creation failed');
      console.log('Status:', chatResponse.status);
      console.log('Error:', await chatResponse.text());
    }
    
    // Test 6: Get User's Chats
    console.log('\n6. Testing Get User Chats...');
    const chatsResponse = await fetch(`${baseUrl}/chats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (chatsResponse.ok) {
      const chatsData = await chatsResponse.json();
      console.log('User chats response:', JSON.stringify(chatsData, null, 2));
      console.log('✅ User chats fetch successful');
      console.log('Number of chats:', chatsData.data.length);
    } else {
      console.log('❌ User chats fetch failed');
      console.log('Status:', chatsResponse.status);
      console.log('Error:', await chatsResponse.text());
    }
    
    console.log('\n🎉 MongoDB Authentication Test Complete!');
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Only run if called directly
if (require.main === module) {
  testMongoAuth();
}

module.exports = { testMongoAuth };