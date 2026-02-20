const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const drawableDirs = [
    'drawable',
    'drawable-hdpi',
    'drawable-mdpi',
    'drawable-xhdpi',
    'drawable-xxhdpi',
    'drawable-xxxhdpi'
];

const basePath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function createNotificationIcon() {
    console.log('Generating transparent notification icon...');

    // Creates a simple 96x96 transparent image with a white circle in the middle
    // In a real app, this should be the silhouette of the app logo.
    const svgBuffer = Buffer.from(`
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" fill="transparent"/>
      <circle cx="48" cy="48" r="32" fill="white" />
      <path d="M48 24 L64 64 L32 64 Z" fill="transparent" stroke="black" stroke-width="4"/>
    </svg>
  `);

    try {
        for (const dir of drawableDirs) {
            const dirPath = path.join(basePath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const targetPath = path.join(dirPath, 'ic_notification.png');

            await sharp(svgBuffer)
                .png()
                .toFile(targetPath);

            console.log(`Created ${targetPath}`);
        }
        console.log('✅ Notification icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

createNotificationIcon();
