// Gera screenshots recomendadas para Web App Manifest usando Sharp
// Saídas:
// - screenshots/desktop-wide-1280x720.png (wide)
// - screenshots/mobile-narrow-720x1280.png (narrow)

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

async function ensureDir(dir) {
    await fs.promises.mkdir(dir, { recursive: true });
}

async function generate() {
    const screenshotsDir = path.join(__dirname, 'screenshots');
    const source = path.join(screenshotsDir, 'Diario de bordo 2025-12-19 .png');

    // Verifica origem
    if (!fs.existsSync(source)) {
        console.error('Imagem de origem não encontrada:', source);
        process.exit(1);
    }

    await ensureDir(screenshotsDir);

    const outputs = [
        {
            file: path.join(screenshotsDir, 'desktop-wide-1280x720.png'),
            width: 1280,
            height: 720,
            label: 'wide (desktop)'
        },
        {
            file: path.join(screenshotsDir, 'mobile-narrow-720x1280.png'),
            width: 720,
            height: 1280,
            label: 'narrow (mobile)'
        }
    ];

    for (const out of outputs) {
        console.log('Gerando', out.label, '→', out.file);
        await sharp(source)
            .resize(out.width, out.height, {
                fit: 'contain', // preserva proporção
                background: { r: 245, g: 247, b: 250, alpha: 1 } // fundo claro
            })
            .png()
            .toFile(out.file);
    }

    console.log('Concluído. Arquivos gerados em:', screenshotsDir);
}

generate().catch(err => {
    console.error('Falha ao gerar screenshots:', err);
    process.exit(1);
});
