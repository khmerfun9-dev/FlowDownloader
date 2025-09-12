#!/usr/bin/env node

/**
 * FlowDownloader Domain Setup Helper
 * Interactive script to guide through domain configuration
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log(colorize('\n========================================', 'cyan'));
  console.log(colorize('FlowDownloader Domain Setup Helper', 'cyan'));
  console.log(colorize('========================================\n', 'cyan'));

  try {
    // Check if Vercel CLI is installed
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.log(colorize('❌ Vercel CLI not found. Installing...', 'red'));
    try {
      execSync('npm install -g vercel@latest', { stdio: 'inherit' });
      console.log(colorize('✅ Vercel CLI installed successfully', 'green'));
    } catch (installError) {
      console.log(colorize('❌ Failed to install Vercel CLI. Please install manually:', 'red'));
      console.log(colorize('npm install -g vercel@latest', 'yellow'));
      process.exit(1);
    }
  }

  console.log(colorize('Welcome to the FlowDownloader domain setup!', 'bright'));
  console.log('This script will help you configure your custom domain.\n');

  // Get domain information
  const domain = await question(colorize('Enter your domain name (e.g., flowdownloader.com): ', 'yellow'));
  
  if (!domain || !domain.includes('.')) {
    console.log(colorize('❌ Invalid domain format. Please enter a valid domain.', 'red'));
    process.exit(1);
  }

  const subdomain = await question(colorize('Enter subdomain (leave empty for root domain): ', 'yellow'));
  const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;

  console.log(colorize(`\n📋 Domain Configuration Summary:`, 'bright'));
  console.log(`   Domain: ${colorize(fullDomain, 'green')}`);
  console.log(`   Root Domain: ${colorize(domain, 'green')}\n`);

  // Domain provider selection
  console.log(colorize('Select your domain provider:', 'bright'));
  console.log('1. Cloudflare');
  console.log('2. GoDaddy');
  console.log('3. Namecheap');
  console.log('4. Google Domains');
  console.log('5. Other\n');

  const provider = await question(colorize('Enter your choice (1-5): ', 'yellow'));

  // Generate DNS instructions
  console.log(colorize('\n🔧 DNS Configuration Instructions:', 'bright'));
  console.log(colorize('=====================================\n', 'cyan'));

  if (subdomain) {
    console.log(colorize('Add the following CNAME record:', 'yellow'));
    console.log(`Type: ${colorize('CNAME', 'green')}`);
    console.log(`Name: ${colorize(subdomain, 'green')}`);
    console.log(`Value: ${colorize('cname.vercel-dns.com', 'green')}`);
  } else {
    console.log(colorize('Add the following A records:', 'yellow'));
    console.log(`Type: ${colorize('A', 'green')}`);
    console.log(`Name: ${colorize('@', 'green')}`);
    console.log(`Value: ${colorize('76.76.19.19', 'green')}\n`);
    
    console.log(`Type: ${colorize('A', 'green')}`);
    console.log(`Name: ${colorize('@', 'green')}`);
    console.log(`Value: ${colorize('76.223.126.88', 'green')}\n`);

    console.log(colorize('Add the following CNAME record for www:', 'yellow'));
    console.log(`Type: ${colorize('CNAME', 'green')}`);
    console.log(`Name: ${colorize('www', 'green')}`);
    console.log(`Value: ${colorize('cname.vercel-dns.com', 'green')}`);
  }

  console.log(colorize('\n⏱️  DNS Propagation:', 'bright'));
  console.log('DNS changes can take 24-48 hours to propagate globally.');
  console.log('You can check propagation status at: https://dnschecker.org\n');

  // Vercel domain setup
  const setupNow = await question(colorize('Would you like to add this domain to Vercel now? (y/n): ', 'yellow'));
  
  if (setupNow.toLowerCase() === 'y' || setupNow.toLowerCase() === 'yes') {
    console.log(colorize('\n🚀 Adding domain to Vercel...', 'bright'));
    
    try {
      // Login to Vercel if needed
      console.log('Checking Vercel authentication...');
      execSync('vercel whoami', { stdio: 'ignore' });
    } catch (error) {
      console.log('Please log in to Vercel:');
      execSync('vercel login', { stdio: 'inherit' });
    }

    try {
      // Add domain to Vercel
      console.log(`Adding domain ${fullDomain} to Vercel...`);
      execSync(`vercel domains add ${fullDomain}`, { stdio: 'inherit' });
      
      console.log(colorize('\n✅ Domain added successfully!', 'green'));
      console.log(colorize('\n📝 Next Steps:', 'bright'));
      console.log('1. Configure the DNS records as shown above');
      console.log('2. Wait for DNS propagation (24-48 hours)');
      console.log('3. Visit your Vercel dashboard to verify domain status');
      console.log('4. Deploy your application to the custom domain\n');
      
    } catch (error) {
      console.log(colorize('\n⚠️  Domain setup encountered an issue.', 'yellow'));
      console.log('Please add the domain manually in your Vercel dashboard.');
      console.log('Visit: https://vercel.com/dashboard\n');
    }
  }

  // Generate summary file
  const summaryContent = `# FlowDownloader Domain Configuration\n\nDomain: ${fullDomain}\nRoot Domain: ${domain}\nSetup Date: ${new Date().toISOString()}\n\n## DNS Records\n\n${subdomain ? 
    `### CNAME Record\nType: CNAME\nName: ${subdomain}\nValue: cname.vercel-dns.com` :
    `### A Records\nType: A\nName: @\nValue: 76.76.19.19\n\nType: A\nName: @\nValue: 76.223.126.88\n\n### CNAME Record\nType: CNAME\nName: www\nValue: cname.vercel-dns.com`
  }\n\n## Verification\n\n- DNS Checker: https://dnschecker.org/?domain=${fullDomain}\n- Vercel Dashboard: https://vercel.com/dashboard\n- SSL Certificate: Automatically provided by Vercel\n\n## Notes\n\n- DNS propagation can take 24-48 hours\n- SSL certificate will be automatically provisioned\n- Redirects from www to root domain (or vice versa) are handled automatically\n`;

  require('fs').writeFileSync('domain-setup-summary.md', summaryContent);
  console.log(colorize('📄 Configuration summary saved to: domain-setup-summary.md', 'green'));

  console.log(colorize('\n🎉 Domain setup complete!', 'bright'));
  console.log(colorize('Thank you for using FlowDownloader!\n', 'cyan'));

  rl.close();
}

main().catch(error => {
  console.error(colorize('❌ An error occurred:', 'red'), error.message);
  rl.close();
  process.exit(1);
});