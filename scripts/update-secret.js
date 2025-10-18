//update-secret.js

const { Octokit } = require("@octokit/rest");
const sodium = require("tweetsodium");
const fs = require("fs");

const token = process.env.GH_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const [owner, repoName] = repo.split("/");

(async () => {
  try {
    console.log("📦 Lendo cookies atualizados...");
    const cookies = fs.readFileSync("cookies_atualizados.json", "utf8");

    const octokit = new Octokit({ auth: token });

    // Obter a chave pública do repositório
    const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
      owner,
      repo: repoName,
    });

    const key = publicKeyData.key;
    const key_id = publicKeyData.key_id;

    // Criptografar valor
    const messageBytes = Buffer.from(cookies);
    const keyBytes = Buffer.from(key, "base64");
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);
    const encrypted_value = Buffer.from(encryptedBytes).toString("base64");

    // Atualizar secret
    await octokit.actions.createOrUpdateRepoSecret({
      owner,
      repo: repoName,
      secret_name: "ALIEXPRESS_COOKIES_JSON",
      encrypted_value,
      key_id,
    });

    console.log("✅ Secret ALIEXPRESS_COOKIES_JSON atualizada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar secret:", error.message);
  }
})();
