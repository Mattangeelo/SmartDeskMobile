# Git Flow

- main: entrega validada.
- development: integra??o das funcionalidades.
- feature/*: trabalho isolado a partir da integra??o.
- release/*: estabiliza??o antes da main.
- hotfix/*: corre??o urgente a partir da main, incorporada de volta ? integra??o.

Fluxo: feature -> development -> release -> main -> development. Use merge sem squash para preservar a rastreabilidade. Nunca use force-push nas branches compartilhadas.

Antes de promover, execute a CI do reposit?rio, confira diferen?as e valide o ambiente integrado. Quando houver prote??o no GitHub, publique a branch e abra PR; n?o contorne regras de revis?o ou checks obrigat?rios. Os workflows de valida??o est?o em .github/workflows. Prote??es e checks obrigat?rios precisam ser configurados no GitHub; o arquivo YAML n?o configura prote??o sozinho. Deploy continua sendo uma opera??o separada.

Os arquivos .env locais foram autorizados para versionamento pelo solicitante nesta entrega. A autoriza??o n?o se estende a chaves privadas, credenciais Git ou futuras credenciais de produ??o. N?o copie segredos para logs de CI.
