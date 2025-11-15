// Simple script to test OpenAI API key
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Read API key from environment
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

console.log('🔑 Testing OpenAI API key...');
console.log('📝 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

// Test with a simple moderation request
const testData = JSON.stringify({
  input: "This is a test message to check if the API key works",
  model: "text-moderation-latest"
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/moderations',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('🚀 Making test request to OpenAI API...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Status:', res.statusCode);
    
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        console.log('✅ API Key is working!');
        console.log('📋 Moderation Result:');
        console.log('   - Flagged:', result.results[0].flagged);
        console.log('   - Categories:', Object.keys(result.results[0].categories).filter(cat => result.results[0].categories[cat]));
        console.log('   - Model:', result.model);
        console.log('   - ID:', result.id);
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    } else {
      console.error('❌ API request failed');
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(testData);
req.end();
