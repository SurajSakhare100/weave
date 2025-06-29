import dotenv from 'dotenv';
import cloudinary from './config/cloudinary.js';
import { uploadImage, validateImageFile } from './utils/imageUpload.js';

// Load environment variables
dotenv.config();

/**
 * Test Cloudinary configuration
 */
const testCloudinaryConfig = () => {
  console.log('🔧 Testing Cloudinary Configuration...');
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    console.error('Please add these to your .env file');
    return false;
  }
  
  console.log('✅ All Cloudinary environment variables are set');
  return true;
};

/**
 * Test Cloudinary connection
 */
const testCloudinaryConnection = async () => {
  console.log('🔗 Testing Cloudinary Connection...');
  
  try {
    // Test basic connection by getting account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

/**
 * Test image upload functionality
 */
const testImageUpload = async () => {
  console.log('📤 Testing Image Upload...');
  
  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Test file validation
    const mockFile = {
      buffer: testImageBuffer,
      mimetype: 'image/png',
      size: testImageBuffer.length
    };
    
    const isValid = validateImageFile(mockFile);
    if (!isValid) {
      console.error('❌ File validation failed');
      return false;
    }
    
    console.log('✅ File validation passed');
    
    // Test upload
    const result = await uploadImage(
      testImageBuffer, 
      'weave-test', 
      `test_${Date.now()}`
    );
    
    console.log('✅ Image upload successful');
    console.log('📊 Upload result:', {
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    });
    
    return true;
  } catch (error) {
    console.error('❌ Image upload test failed:', error.message);
    return false;
  }
};

/**
 * Test folder creation
 */
const testFolderCreation = async () => {
  console.log('📁 Testing Folder Creation...');
  
  try {
    // Test if we can access the weave-products folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'weave-products/',
      max_results: 1
    });
    
    console.log('✅ Folder access successful');
    return true;
  } catch (error) {
    console.error('❌ Folder access failed:', error.message);
    return false;
  }
};

/**
 * Main test function
 */
const runTests = async () => {
  console.log('🚀 Starting Cloudinary Tests...\n');
  
  const tests = [
    { name: 'Configuration', test: testCloudinaryConfig },
    { name: 'Connection', test: testCloudinaryConnection },
    { name: 'Folder Access', test: testFolderCreation },
    { name: 'Image Upload', test: testImageUpload }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const testCase of tests) {
    console.log(`\n--- ${testCase.name} Test ---`);
    const result = await testCase.test();
    if (result) passed++;
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Cloudinary is ready to use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests }; 