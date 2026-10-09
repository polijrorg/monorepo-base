// Confere a configuração de deploy antes de publicar. Usado pelos workflows
// eas.yml e mobile-release.yml, mas também dá pra rodar local (de dentro de mobile/):
//   node scripts/check-deploy-config.js                       → updates.url × projectId
//   node scripts/check-deploy-config.js --ios-submit          → + ascAppId pro envio iOS
//   node scripts/check-deploy-config.js --tag mobile-v1.2.0   → + tag igual ao version do app.json
const appConfig = require('../app.json').expo;
const easConfig = require('../eas.json');

const args = process.argv.slice(2);
const errors = [];

// O app baixa OTA do updates.url; o eas update publica no projectId.
// Se os dois apontam pra projetos diferentes, os updates nunca chegam.
const projectId = appConfig.extra?.eas?.projectId;
const updatesUrl = appConfig.updates?.url;
if (projectId && updatesUrl && updatesUrl !== `https://u.expo.dev/${projectId}`) {
  errors.push(
    `updates.url (${updatesUrl}) não aponta pro projectId (${projectId}). Rode "eas update:configure" em mobile/.`
  );
}

if (args.includes('--ios-submit') && !easConfig.submit?.production?.ios?.ascAppId) {
  errors.push(
    'Falta submit.production.ios.ascAppId no eas.json. Sem ele o envio pro iOS falha no CI (DEPLOY.md, seção 5.3).'
  );
}

const tagIndex = args.indexOf('--tag');
if (tagIndex !== -1) {
  const tag = args[tagIndex + 1];
  const expected = `mobile-v${appConfig.version}`;
  if (tag !== expected) {
    errors.push(`A tag ${tag} não bate com o version do app.json (esperado: ${expected}).`);
  }
}

for (const message of errors) {
  console.error(process.env.GITHUB_ACTIONS ? `::error::${message}` : `Erro: ${message}`);
}
if (errors.length > 0) {
  process.exit(1);
}
console.log('Configuração de deploy ok.');
