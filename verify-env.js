#!/usr/bin/env node

/**
 * Verify that environment variables are loaded correctly
 * Run: npm run verify-env
 */

const fs = require('fs');
const path = require('path');

const envFiles = ['.env.local', '.env'];
const baseDir = __dirname;

function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach((line) => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key) {
          env[key.trim()] = value ? value.trim() : '';
        }
      }
    });
    return env;
  } catch (error) {
    return null;
  }
}

console.log('\n📋 Environment File Verification\n');
console.log(`Base Directory: ${baseDir}\n`);

// Check which env files exist
console.log('📁 Checking for env files:');
const envFilesStatus = {};
envFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅ EXISTS' : '❌ MISSING';
  envFilesStatus[file] = exists;
  console.log(`  ${file}: ${status}`);
});

console.log('\n📖 Load Priority (first found wins):');
envFiles.forEach((file, index) => {
  const status = envFilesStatus[file] ? '✅' : '❌';
  console.log(`  ${index + 1}. ${file} ${status}`);
});

// Load and display env values
console.log('\n🔍 Environment Variables from Files:');
let merged = {};
// Load in reverse order so first item in array has highest priority
for (let i = envFiles.length - 1; i >= 0; i--) {
  const filePath = path.join(baseDir, envFiles[i]);
  const env = parseEnvFile(filePath);
  if (env) {
    merged = { ...env, ...merged }; // Higher priority overrides lower
  }
}

const keysToShow = ['MONGO_URI', 'PORT', 'NODE_ENV', 'JWT_SECRET', 'SMS_PROVIDER'];
keysToShow.forEach((key) => {
  const value = merged[key];
  const masked = key.includes('SECRET') ? '***' : value;
  const source = envFiles.find((file) => {
    const env = parseEnvFile(path.join(baseDir, file));
    return env && env[key];
  });
  console.log(`  ${key}: ${masked || '(undefined)'} ${source ? `(from ${source})` : ''}`);
});

// Check if .env.local is properly configured
console.log('\n✨ Configuration Status:');
if (envFilesStatus['.env.local']) {
  const localEnv = parseEnvFile(path.join(baseDir, '.env.local'));
  const mongoUri = localEnv && localEnv.MONGO_URI;
  
  if (mongoUri && mongoUri.includes('localhost')) {
    console.log('  ✅ .env.local is configured correctly (MONGO_URI uses localhost)');
    console.log(`     MONGO_URI: ${mongoUri}`);
  } else if (mongoUri && mongoUri.includes('mongodb:')) {
    console.log('  ⚠️  .env.local exists but has Docker URI (should use localhost)');
    console.log(`     MONGO_URI: ${mongoUri}`);
    console.log('     Edit .env.local to use: mongodb://localhost:27017/toolzkart');
  } else {
    console.log('  ⚠️  .env.local exists but MONGO_URI is not set');
  }
} else {
  console.log('  ℹ️  .env.local does not exist (will use .env defaults)');
  console.log('     For local development, create .env.local:');
  console.log('     cp .env.local.example .env.local');
}

// Show what NestJS will load
console.log('\n🚀 NestJS will load (in order):');
console.log('  1. .env.local (if exists)');
console.log('  2. .env (fallback)');
console.log('  3. process.env (system variables)');

console.log('\n');
