// update-secret.js
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

(async () => {
  try {
    const token = process.env.GH_TOKEN;
    const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    const secretName = 'ALIEXPRESS_COOKIES_JSON';

    const octokit = new Octokit({ auth: token });

    // Lê os cookies atualizados
    const cookiesFile = 'cookies_atualizados.json';
    if (!fs.existsSync(cookiesFile)) {
      console.log('❌ Nenhum arquivo de cookies encontrado');
      process.exit(0);
    }

    const secretValue = fs.readFileSync(cookiesFile, 'utf8');
    console.log('📦 Lendo cookies atualizados...');

    // Busca a chave pública para criptografar a secret
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo
    });

    const sodium = require('tweetsodium');

    // Criptografa o conteúdo
    const messageBytes = Buffer.from(secretValue);
    const keyBytes = Buffer.from(publicKey.key, 'base64');
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encryptedValue = Buffer.from(encryptedBytes).toString('base64');

    // Atualiza a secret
    await octokit.actions.createOrUpdateRepoSecret({
      owner,
      repo,
      secret_name: secretName,
      encrypted_value: encryptedValue,
      key_id: publicKey.key_id
    });

    console.log(`✅ Secret ${secretName} atualizada com sucesso!`);
  } catch (err) {
    console.error('💥 Erro ao atualizar secret:', err.message);
    process.exit(1);
  }
})();
