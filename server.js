const http = require('http');
const fs = require('fs');
const path = require('path');

let conceptos = [];
let idCounter = 1;

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Permitir CORS para pruebas
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    if (req.url === '/' || req.url === '/index.html') {
      // Leer y devolver index.html
      const filePath = path.join(__dirname, 'index.html');
      fs.readFile(filePath, 'utf-8', (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error al cargar la página');
        } else {
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(200);
          res.end(content);
        }
      });
    } else if (req.url === '/conceptos') {
      // GET todos los conceptos
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(conceptos));
    } else if (req.url.match(/^\/conceptos\/\d+$/)) {
      // GET concepto por id
      const id = parseInt(req.url.split('/')[2]);
      const concepto = conceptos.find(c => c.id === id);
      if (concepto) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(concepto));
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Concepto no encontrado'}));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  } else if (req.method === 'POST' && req.url === '/conceptos') {
    // POST agregar concepto
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const concepto = JSON.parse(body);
        concepto.id = idCounter++;
        conceptos.push(concepto);
        res.writeHead(201, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(concepto));
      } catch {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'JSON inválido'}));
      }
    });
  } else if (req.method === 'DELETE') {
    if (req.url === '/conceptos') {
      // DELETE todos los conceptos
      conceptos = [];
      res.writeHead(204);
      res.end();
    } else if (req.url.match(/^\/conceptos\/\d+$/)) {
      // DELETE concepto por id
      const id = parseInt(req.url.split('/')[2]);
      const index = conceptos.findIndex(c => c.id === id);
      if (index !== -1) {
        conceptos.splice(index, 1);
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Concepto no encontrado'}));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:3000/`);
});
