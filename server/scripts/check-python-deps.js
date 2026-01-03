#!/usr/bin/env node
/**
 * Check if Python and required dependencies are available
 * This script can be run during build to verify the environment
 */

const { spawn } = require('child_process');
const path = require('path');

async function checkPython() {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.env.PYTHON_CMD || 'python3';
    const checkProcess = spawn(pythonCmd, ['--version']);
    
    let output = '';
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Python found: ${output.trim()}`);
        resolve(pythonCmd);
      } else {
        // Try python as fallback
        const fallbackProcess = spawn('python', ['--version']);
        let fallbackOutput = '';
        fallbackProcess.stdout.on('data', (data) => {
          fallbackOutput += data.toString();
        });
        fallbackProcess.on('close', (fallbackCode) => {
          if (fallbackCode === 0) {
            console.log(`✅ Python found (fallback): ${fallbackOutput.trim()}`);
            resolve('python');
          } else {
            reject(new Error('Python not found. Please install Python 3.'));
          }
        });
      }
    });
    
    checkProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        // Try python as fallback
        const fallbackProcess = spawn('python', ['--version']);
        let fallbackOutput = '';
        fallbackProcess.stdout.on('data', (data) => {
          fallbackOutput += data.toString();
        });
        fallbackProcess.on('close', (fallbackCode) => {
          if (fallbackCode === 0) {
            console.log(`✅ Python found (fallback): ${fallbackOutput.trim()}`);
            resolve('python');
          } else {
            reject(new Error('Python not found. Please install Python 3.'));
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

async function checkPythonDependencies(pythonCmd) {
  return new Promise((resolve, reject) => {
    const checkProcess = spawn(pythonCmd, [
      '-c',
      'import google.generativeai; import json; import os; print("OK")'
    ]);
    
    let errorOutput = '';
    checkProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    checkProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python dependencies check passed');
        resolve(true);
      } else {
        console.error('❌ Python dependencies missing:');
        console.error(errorOutput);
        reject(new Error('Required Python packages not installed. Run: pip install -r ai-services/requirements.txt'));
      }
    });
    
    checkProcess.on('error', reject);
  });
}

async function main() {
  try {
    console.log('Checking Python environment...');
    const pythonCmd = await checkPython();
    await checkPythonDependencies(pythonCmd);
    console.log('✅ Python environment is ready');
    process.exit(0);
  } catch (error) {
    console.error('❌ Python environment check failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkPython, checkPythonDependencies };
