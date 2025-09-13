// Test script for LoveLocker API endpoints
// Run with: node test-api.js

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';

async function testAPI() {
    console.log('🧪 Testing LoveLocker API Endpoints');
    console.log('=====================================');
    
    // Test data
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        password: 'testpassword123'
    };
    
    try {
        // Test 1: Registration
        console.log('\n1. Testing Registration...');
        const registerResponse = await fetch(`${BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                ...testUser
            })
        });
        
        const registerResult = await registerResponse.json();
        console.log('Registration Status:', registerResponse.status);
        console.log('Registration Result:', registerResult);
        
        if (registerResponse.ok) {
            console.log('✅ Registration successful');
            
            // Test 2: Login
            console.log('\n2. Testing Login...');
            const loginResponse = await fetch(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: testUser.email,
                    password: testUser.password
                })
            });
            
            const loginResult = await loginResponse.json();
            console.log('Login Status:', loginResponse.status);
            console.log('Login Result:', loginResult);
            
            if (loginResponse.ok) {
                console.log('✅ Login successful');
            } else {
                console.log('❌ Login failed:', loginResult.error);
            }
        } else {
            console.log('❌ Registration failed:', registerResult.error);
        }
        
        // Test 3: Forgot Password
        console.log('\n3. Testing Forgot Password...');
        const forgotResponse = await fetch(`${BASE_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'forgotPassword',
                email: testUser.email
            })
        });
        
        const forgotResult = await forgotResponse.json();
        console.log('Forgot Password Status:', forgotResponse.status);
        console.log('Forgot Password Result:', forgotResult);
        
        if (forgotResponse.ok) {
            console.log('✅ Forgot password successful');
        } else {
            console.log('❌ Forgot password failed:', forgotResult.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testAPI();
