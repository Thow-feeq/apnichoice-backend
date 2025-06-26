// Load environment variables from your .env file
import dotenv from 'dotenv';
dotenv.config();

// Import your email sending utility
import sendEmail from './utils/emailServices.js';  // Adjust the path if needed

const test = async () => {
    try {
        // Replace with your actual email to test
        await sendEmail('thowfiqahamed9@gmail.com', 'Test Status');
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '*****' : 'Not Set');
        console.log('✅ Email test completed.');
    } catch (err) {
        console.error('❌ Email test failed:', err);
    }
};

test();
