# mypass - API para Armazenamento de Senhas

<div>
    <img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
    <img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white"/>
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
</div>

## Descrição :key:

O projeto 'mypass' é uma API REST desenvolvida em Node.js que permite armazenar senhas com segurança. Esta API foi criada para simplificar o processo de gerenciamento de senhas e fornecer uma maneira segura de armazenar e recuperar informações confidenciais.

## Funcionalidades :computer:

- Autenticação e segurança da senha do usuário através de hash;
- Criação, leitura, atualização e exclusão de senhas criptografadas.
- Autenticação de usuários para garantir a segurança dos dados (JWT).
- Armazenamento seguro de senhas usando criptografia (somente o usuário da senha poderá recuperá-la, após a autenticação).

## Pré-requisitos :small_blue_diamond:

Certifique-se de ter as seguintes ferramentas instaladas em seu sistema:

- [Node.js](https://nodejs.org/)

- [npm](https://www.npmjs.com/) (gerenciador de pacotes do Node.js)
- Banco de dados (por exemplo, MongoDB, PostgreSQL, ou SQLite) (Estou usando o MongoDB com mongoose).

## Configuração :wrench:

1. Clone este repositório: `git clone https://github.com/Davidemanoel7/mypass.git`
2. Navegue até o diretório do projeto: `cd mypass`
3. Instale as dependências: `npm install`

## Variáveis de ambiente :globe_with_meridians:

Na raiz do projeto, configure as variáveis de ambiente em dois arquivos: `.env` e `nodemon.json`.

**No arquivo `.env` criado, crie as seguintes variáveis, como mostrado no exemplo abaixo:**

```.env
DATA_BASE = 'your_mongo_data_base_connection_link'
PORT = OUR_PORT_HERE or 3000
SECRETKEY = 'MySecreKey'
ALGORITHM = 'Algorithm'
```

Onde:

- `DATA_BASE`: Link de um banco de dados do mongoDB. [Comece por aqui](https://www.mongodb.com/docs/atlas/tutorial/create-atlas-account/).

- `SECRETKEY`: Uma string de referência durante a criptografia e decriptografia de uma senha.

- `ALGORITHM`: Algoritmos utilizados na criptogragia e decriptografia das senhas. [Documentação](https://cryptojs.gitbook.io/docs/)

**No arquivo `nodemon.json` criado, crie as seguintes variáveis, como mostrado no exemplo abaixo:**

```json
{
    "env": {
        "MONGO_ATLAS_PASS": "your_atlas_pass",
        "JWT_KEY": "jwt_key_here"
    }
}
```

Onde:

- `MONGO_ATLAS_PASS`: Senha do Atlas presente na variável `DATA_BASE` do `.env`
- `JWT_KEY`: Palavra chave utilizada no arquivo `/src/middleware/check-auth.js` para verificar o token de autenticação (JWT).

## Uso :white_check_mark:

1. Inicie o servidor: `npm start`
2. Acesse a API em `http://localhost:3000` (ou outra porta configurado).

## Autenticação :lock:

A autenticação de usuário será necessária para acessar algumas rotas da API, ou seja, para testar algumas rotas é necessário criar uma conta (como admin ou common).

## Documentação :page_facing_up:

Neste [swagger](https://app.swaggerhub.com/apis-docs/DAVIDEMANOEL706/MyPass/1.0.0) contém a documentação da API contendo as endpoints e os schemas.

## Contribuição :bulb:

Sinta-se à vontade para contribuir com melhorias ou correções para este projeto. Abra uma issue ou envie um pull request.

## Licença :scroll:

Este projeto está sob a [Licença MIT](LICENSE).

## Tutorial :paperclip:

Estou seguindo o <a href="https://www.youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q" target="_blank">tutorial</a> da playlist do canal Academind para a construção desta API.

---

© 2023 Davidemanoel7
