import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const setEnvVars = (config, prefix = '') => {
  for (const chave in config) {
    const valor = config[chave];
    const nomeVariavelEnv = prefix ? `${prefix}_${chave.toUpperCase()}` : chave.toUpperCase();

    if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
      setEnvVars(valor, nomeVariavelEnv);
    } else {
      process.env[nomeVariavelEnv] = valor;
    }
  }
};

function loadConfig() {
  try {
    const caminhoArquivo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'config.yaml');
    const doc = yaml.load(fs.readFileSync(caminhoArquivo, 'utf8'));

    const ambiente = process.env.NODE_ENV || 'development';
    const configDoAmbiente = doc[ambiente];

    setEnvVars(configDoAmbiente);

    console.log("Configuração carregada com sucesso!");
  } catch (e) {
    console.log(`Erro na leitura da config.yaml. Erro: ${e}`);
    process.exit(1);
  }
}

export default loadConfig;