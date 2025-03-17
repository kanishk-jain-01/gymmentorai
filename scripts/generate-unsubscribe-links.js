const { PrismaClient } = require('@prisma/client');
const { generateUnsubscribeUrl } = require('./email-utils');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all users who are subscribed to emails
    const users = await prisma.user.findMany({
      where: {
        subscribedToEmails: true,
        email: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    console.log(`Found ${users.length} subscribed users`);

    // Generate unsubscribe links for each user
    const emailData = users.map(user => {
      const unsubscribeUrl = generateUnsubscribeUrl(user.email);
      return {
        email: user.email,
        name: user.name || 'User',
        unsubscribeUrl
      };
    });

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'email-data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write to CSV file
    const csvPath = path.join(outputDir, `email-list-${new Date().toISOString().split('T')[0]}.csv`);
    const csvContent = [
      'Email,Name,UnsubscribeUrl',
      ...emailData.map(data => `${data.email},"${data.name}",${data.unsubscribeUrl}`)
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);
    console.log(`Email data written to ${csvPath}`);

    // Also write to JSON file for programmatic use
    const jsonPath = path.join(outputDir, `email-list-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(emailData, null, 2));
    console.log(`Email data written to ${jsonPath}`);

  } catch (error) {
    console.error('Error generating unsubscribe links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 