import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;

console.log('🧪 Testing Hugging Face API...\n');
console.log('API Key:', API_KEY?.substring(0, 15) + '...');
console.log('Key exists:', !!API_KEY, '\n');

if (!API_KEY) {
  console.error('❌ HUGGINGFACE_API_KEY not found in .env');
  process.exit(1);
}

const hf = new HfInference(API_KEY);

async function test() {
  try {
    console.log('📤 Sending test request...');
    
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: '<s>[INST] Say "Hello! Hugging Face API is working perfectly!" if you receive this. [/INST]',
      parameters: {
        max_new_tokens: 50,
        temperature: 0.7,
        return_full_text: false
      }
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', response.generated_text);
    console.log('\n🎉 Hugging Face API is working!\n');
    console.log('✅ Your chatbot will work now!');
    
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if your API token is correct');
    console.error('2. Get token from: https://huggingface.co/settings/tokens');
    console.error('3. Make sure token has "Read" permission');
  }
}

test();