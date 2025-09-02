import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const setEnvVars = (config, prefix = '') => {
  for (const key in config) {
    const value = config[key];
    const envVarName = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase();

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      setEnvVars(value, envVarName);
    } else {
      process.env[envVarName] = value;
    }
  }
};

try {
  const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'config.yaml');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const doc = yaml.load(configFile);

  const environment = process.env.NODE_ENV || 'development';
  const environmentConfig = doc[environment];

  if (environmentConfig) {
    setEnvVars(environmentConfig);
    console.log(`Configuração para o ambiente '${environment}' carregada com sucesso!`);
  } else {
    throw new Error(`Configuração para o ambiente '${environment}' não encontrada no config.yaml`);
  }

} catch (e) {
  console.error(`Falha crítica ao ler o arquivo config.yaml. Erro: ${e.message}`);
  process.exit(1);
}
