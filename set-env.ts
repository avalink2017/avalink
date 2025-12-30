const fs = require('fs');
// Cambiamos la ruta para que afecte específicamente al archivo de producción
const targetPath = './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: true,
  apiUrl: '${process.env['API_URL'] || ''}',
  apiKey: '${process.env['API_KEY'] || ''}',
  turnstileKey: '${process.env['TURNSTILE_SITE_KEY'] || ''}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log('✅ environment.ts generado dinámicamente');
