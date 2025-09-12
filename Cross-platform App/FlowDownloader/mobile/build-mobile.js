#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'yellow');
  
  // Check if EAS CLI is installed
  try {
    execSync('eas --version', { stdio: 'pipe' });
    log('✅ EAS CLI is installed', 'green');
  } catch (error) {
    log('❌ EAS CLI not found. Installing...', 'red');
    execCommand('npm install -g eas-cli', 'Installing EAS CLI');
  }
  
  // Check if logged in to Expo
  try {
    execSync('eas whoami', { stdio: 'pipe' });
    log('✅ Logged in to Expo', 'green');
  } catch (error) {
    log('⚠️  Not logged in to Expo. Please run: eas login', 'yellow');
  }
  
  // Check if assets exist
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    log('📱 Creating mobile assets...', 'cyan');
    execCommand('node create-mobile-assets.js', 'Creating assets');
  } else {
    log('✅ Assets directory exists', 'green');
  }
}

function showMenu() {
  log('\n📱 FlowDownloader Mobile Build Tool', 'bright');
  log('=====================================', 'bright');
  log('\nSelect build type:');
  log('1. Android Preview (APK)');
  log('2. Android Production (AAB)');
  log('3. Android Production (APK)');
  log('4. iOS Preview (Simulator)');
  log('5. iOS Production (IPA)');
  log('6. Build All Platforms (Preview)');
  log('7. Build All Platforms (Production)');
  log('8. Check Build Status');
  log('9. Submit to App Stores');
  log('0. Exit\n');
}

function getBuildCommand(choice) {
  const commands = {
    '1': 'npm run build:android:preview',
    '2': 'npm run build:android:production',
    '3': 'npm run build:android:apk',
    '4': 'npm run build:ios:preview',
    '5': 'npm run build:ios:production',
    '6': 'npm run build:all:preview',
    '7': 'npm run build:all:production'
  };
  return commands[choice];
}

function handleBuildChoice(choice) {
  const command = getBuildCommand(choice);
  if (command) {
    const descriptions = {
      '1': 'Building Android Preview (APK)',
      '2': 'Building Android Production (AAB)',
      '3': 'Building Android Production (APK)',
      '4': 'Building iOS Preview (Simulator)',
      '5': 'Building iOS Production (IPA)',
      '6': 'Building All Platforms (Preview)',
      '7': 'Building All Platforms (Production)'
    };
    execCommand(command, descriptions[choice]);
  } else if (choice === '8') {
    log('\n🔍 Checking build status...', 'cyan');
    execCommand('eas build:list', 'Fetching build status');
  } else if (choice === '9') {
    log('\n📤 App Store Submission', 'cyan');
    log('\nSelect platform:');
    log('1. Submit Android');
    log('2. Submit iOS');
    log('3. Back to main menu\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter your choice (1-3): ', (submitChoice) => {
      rl.close();
      if (submitChoice === '1') {
        execCommand('npm run submit:android', 'Submitting to Google Play Store');
      } else if (submitChoice === '2') {
        execCommand('npm run submit:ios', 'Submitting to Apple App Store');
      }
    });
  } else if (choice === '0') {
    log('\n👋 Goodbye!', 'green');
    process.exit(0);
  } else {
    log('❌ Invalid choice. Please try again.', 'red');
  }
}

function main() {
  log('🚀 FlowDownloader Mobile Build System', 'bright');
  
  // Check prerequisites
  checkPrerequisites();
  
  // Interactive mode
  if (process.argv.length === 2) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    function promptUser() {
      showMenu();
      rl.question('Enter your choice (0-9): ', (choice) => {
        if (choice === '0') {
          rl.close();
          log('\n👋 Goodbye!', 'green');
          process.exit(0);
        } else if (choice === '9') {
          handleBuildChoice(choice);
          setTimeout(promptUser, 1000);
        } else {
          handleBuildChoice(choice);
          rl.close();
        }
      });
    }
    
    promptUser();
  } else {
    // Command line mode
    const buildType = process.argv[2];
    const command = getBuildCommand(buildType);
    
    if (command) {
      handleBuildChoice(buildType);
    } else {
      log('\n❌ Invalid build type. Available options:', 'red');
      log('  1 - Android Preview (APK)');
      log('  2 - Android Production (AAB)');
      log('  3 - Android Production (APK)');
      log('  4 - iOS Preview (Simulator)');
      log('  5 - iOS Production (IPA)');
      log('  6 - Build All Platforms (Preview)');
      log('  7 - Build All Platforms (Production)');
      log('\nExample: node build-mobile.js 1');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkPrerequisites, handleBuildChoice };