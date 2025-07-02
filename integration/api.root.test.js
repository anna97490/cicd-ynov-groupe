const http = require('http');
const app = require('../app');

// Mock de mongoose (sans casser Schema)
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(() => Promise.resolve()),
    set: jest.fn(),
  };
});

// Mock du modèle BlogPost
jest.mock('../models/blogPost', () => {
  const mockFind = jest.fn(() => ({
    populate: jest.fn().mockResolvedValue([
      { title: 'Titre Test', content: 'Contenu Test', author: '123' },
    ]),
  }));

  function BlogPost(data) {
    Object.assign(this, data);
  }

  BlogPost.prototype.save = jest.fn().mockResolvedValue({
    title: 'Mon Titre',
    content: 'Contenu de test',
    author: '123',
  });

  BlogPost.find = mockFind;

  return BlogPost;
});

let server;
let PORT;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    PORT = server.address().port;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body;
        }
        resolve({ statusCode: res.statusCode, body: parsedBody });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

describe('Intégration API /posts', () => {
  test('GET /posts retourne la liste des posts', async () => {
    const response = await makeRequest('/posts');
    expect(response.statusCode).toBe(200);
    expect(response.body.posts.length).toBeGreaterThan(0);
    expect(response.body.posts[0].title).toBe('Titre Test');
  });

  test('POST /posts crée un post', async () => {
    const newPost = {
      title: 'Mon Titre',
      content: 'Contenu de test',
      author: '123',
    };

    const response = await makeRequest('/posts', 'POST', newPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Mon Titre');
  });
});
