// Importa o framework Express para criar o servidor web
const express = require('express');

// Importa o SQLite e ativa o modo verbose para mensagens de erro mais detalhadas
const sqlite3 = require('sqlite3').verbose();

// Importa o módulo 'path' para trabalhar com caminhos de arquivos de forma segura
const path = require('path');

// Importa o body-parser para interpretar os dados enviados no corpo das requisições
const bodyParser = require('body-parser');

// Cria uma instância do Express
const app = express();

// Abre (ou cria) o banco de dados chamado 'biblioteca.db'
const db = new sqlite3.Database('colecao.db');

// Configura o Express para entender dados JSON no corpo das requisições
app.use(bodyParser.json());

// Configura o Express para entender dados enviados via formulário (URL-encoded)
app.use(bodyParser.urlencoded({ extended: true }));

// Define a pasta 'public' como local de arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Cria a tabela 'livros' no banco de dados, se ainda não existir
db.run(`CREATE TABLE IF NOT EXISTS jogos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    
  nome TEXT NOT NULL,                   
  plataforma TEXT,
  genero TEXT,                            
  ano INTEGER                     
)`);

// Rota GET para listar todos os livros
app.get('/jogos', (req, res) => {
  db.all('SELECT * FROM jogos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); // Se der erro, retorna erro
    res.json(rows); // Envia a lista de livros como resposta JSON
  });
});

// Rota POST para adicionar um novo livro
app.post('/jogos', (req, res) => {
  const { nome, plataforma, genero, ano } = req.body; // Pega os dados do corpo da requisição

  // Insere o novo livro no banco de dados
  db.run(
    'INSERT INTO jogos (nome, plataforma, genero, ano) VALUES (?, ?, ?, ?)',
    [nome, plataforma, genero, ano],
    function (err) {
      if (err) return res.status(500).json({ error: err.message }); // Retorna erro, se houver
      res.json({ id: this.lastID }); // Retorna o ID do livro recém-inserido
    }
  );
});

// Rota PUT para atualizar dados do jogo
app.put('/jogos/:id', (req, res) => {
  const { nome, plataforma, genero, ano } = req.body; // Pega o novo valor da disponibilidade

db.run(
    'UPDATE jogos SET nome = ?, plataforma = ?, genero = ?, ano = ? WHERE id = ?',
    [nome, plataforma, genero, ano, req.params.id], // 'req.params.id' é o último parâmetro, correspondendo ao 'WHERE id = ?'
    function (err) {
      if (err) {
        console.error(err.message); // Imprime o erro no console para depuração
        return res.status(500).json({ error: err.message }); // Se erro, responde com erro
      }
      // Verifica se alguma linha foi realmente modificada
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Jogo não encontrado ou nenhum dado alterado.' });
      }
      res.json({ message: 'Jogo atualizado com sucesso!', changes: this.changes }); // Informa quantas linhas foram modificadas
    }
  );
});


// Rota DELETE para remover um jogo pelo ID
app.delete('/jogos/:id', (req, res) => {
  // Executa o comando SQL para deletar o livro com o ID informado
  db.run('DELETE FROM jogos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message }); // Se erro, responde com erro
    res.json({ deleted: this.changes }); // Retorna quantos livros foram deletados
  });
});

// Inicia o servidor na porta 3000 e exibe uma mensagem no terminal
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
