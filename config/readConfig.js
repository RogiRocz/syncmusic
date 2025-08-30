const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

function loadConfig(){
    try{
        const filePath = path.resolve(__dirname, 'config.yaml')
        const doc = yaml.load(fs.readFileSync(filePath, 'utf8'))

        const env = process.env.NODE_ENV || 'development'
        const config = doc[env]

        if (!config) {
            console.error(`Ambiente '${env}' não encontrado no arquivo de configuração.`);
            process.exit(1);
        }

        for(const key in config){
            process.env[key] = config[key]
        }

        console.log("Configuração carregada com sucesso!")
    }catch(e){
        console.log("Erro na leitura da config.yaml. Erro: ${e}")
        process.exit(1)
    }
}

module.exports = loadConfig