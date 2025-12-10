#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple script to help you run the SQL setup
// This will show you the exact commands to run

async function showSetupInstructions() {
  console.log('🚀 Learning Path Database Setup Instructions\n');
  
  console.log('Since you already have your database set up, here are your options:\n');
  
  console.log('📋 Option 1: Using pgAdmin (Recommended for Windows)');
  console.log('1. Open pgAdmin');
  console.log('2. Connect to your database');
  console.log('3. Right-click on your database → Query Tool');
  console.log('4. Copy and paste the contents of setup-learning-path-tables.sql');
  console.log('5. Click Execute (F5)\n');
  
  console.log('📋 Option 2: Using DBeaver or similar tool');
  console.log('1. Open DBeaver');
  console.log('2. Connect to your PostgreSQL database');
  console.log('3. Open SQL Editor');
  console.log('4. Copy and paste the contents of setup-learning-path-tables.sql');
  console.log('5. Execute the script\n');
  
  console.log('📋 Option 3: Using command line (if you have psql installed)');
  console.log('1. Open Command Prompt as Administrator');
  console.log('2. Navigate to your PostgreSQL bin directory');
  console.log('3. Run: psql -d your_database_name -U your_username -f setup-learning-path-tables.sql\n');
  
  console.log('📋 Option 4: Manual execution');
  console.log('1. Open your database client');
  console.log('2. Copy the SQL from setup-learning-path-tables.sql');
  console.log('3. Execute it section by section\n');
  
  // Read and display the SQL file
  const sqlPath = path.join(__dirname, '../setup-learning-path-tables.sql');
  
  if (fs.existsSync(sqlPath)) {
    console.log('📄 SQL File Location:');
    console.log(`   ${sqlPath}\n`);
    
    console.log('📝 SQL Content Preview (first 10 lines):');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    const lines = sqlContent.split('\n').slice(0, 10);
    lines.forEach((line, index) => {
      console.log(`   ${index + 1}: ${line}`);
    });
    console.log('   ... (and more)\n');
  }
  
  console.log('✅ After running the SQL, you can verify the tables were created by running:');
  console.log(`
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
  table_name LIKE '%learning%' 
  OR table_name LIKE '%study%'
  OR table_name LIKE '%achievement%'
  OR table_name LIKE '%mentorship%'
  OR table_name LIKE '%challenge%'
)
ORDER BY table_name;
  `);
  
  console.log('🎉 Once the tables are created, your Learning Path Optimization feature will be fully functional!');
}

showSetupInstructions();
