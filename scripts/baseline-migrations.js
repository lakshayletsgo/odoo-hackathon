#!/usr/bin/env node

/**
 * Script to baseline Prisma migrations for existing databases
 * This resolves the P3005 error when deploying to databases with existing schema
 */

const { execSync } = require('child_process');

console.log('🔄 Starting migration baseline process...');

try {
  // Generate Prisma client first
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Check if migrations directory exists
  const fs = require('fs');
  const migrationsPath = './prisma/migrations';
  
  if (!fs.existsSync(migrationsPath) || fs.readdirSync(migrationsPath).length === 0) {
    console.log('📝 No migrations found, creating initial migration...');
    execSync('npx prisma migrate dev --name initial', { stdio: 'inherit' });
  } else {
    console.log('🎯 Attempting to deploy migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations deployed successfully!');
    } catch (error) {
      if (error.message.includes('P3005')) {
        console.log('⚠️  P3005 error detected, using db push to sync schema...');
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log('✅ Schema synced with db push!');
      } else {
        throw error;
      }
    }
  }

  console.log('🎉 Migration baseline completed successfully!');
} catch (error) {
  console.error('❌ Migration baseline failed:', error.message);
  process.exit(1);
}
