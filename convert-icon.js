const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');

async function convert() {
  // Step 1: Convert JPEG to proper 256x256 PNG
  const pngBuffer = await sharp('src/assets/icon.png')
    .resize(256, 256)
    .png()
    .toBuffer();
  
  // Save the proper PNG
  fs.writeFileSync('src/assets/icon-256.png', pngBuffer);
  console.log('✅ Created icon-256.png (' + pngBuffer.length + ' bytes)');

  // Step 2: Convert PNG to ICO
  const icoBuffer = await pngToIco(pngBuffer);
  fs.writeFileSync('src/assets/icon.ico', icoBuffer);
  console.log('✅ Created icon.ico (' + icoBuffer.length + ' bytes)');
}

convert().catch(e => console.error('Error:', e));
