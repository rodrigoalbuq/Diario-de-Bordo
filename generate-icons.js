// Gera PNGs a partir dos SVGs dos ícones
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
    const srcSvg = path.join(__dirname, 'icons', 'icon-512.svg');
    const out192 = path.join(__dirname, 'icons', 'icon-192.png');
    const out512 = path.join(__dirname, 'icons', 'icon-512.png');

    if (!fs.existsSync(srcSvg)) {
        console.error('SVG de origem não encontrado:', srcSvg);
        process.exit(1);
    }

    try {
        // 192x192
        await sharp(srcSvg)
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(out192);
        console.log('Gerado:', out192);

        // 512x512
        await sharp(srcSvg)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(out512);
        console.log('Gerado:', out512);

        console.log('Ícones PNG gerados com sucesso.');
    } catch (err) {
        console.error('Falha ao gerar PNGs:', err);
        process.exit(1);
    }
}

run();
