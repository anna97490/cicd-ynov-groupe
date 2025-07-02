const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const BlogPost = require('./models/blogPost');

// Mock propre de mongoose (sans casser Schema)
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(() => Promise.resolve()),
    set: jest.fn(),
  };
});

// Mock du modèle BlogPost
jest.mock('./models/blogPost', () => {
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

function makeRequest(path, method = 'GET', data = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
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

describe('Tests API Express sans supertest ni axios', () => {
  test('GET / => Hello World', async () => {
    const response = await makeRequest('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello World');
  });

  test('GET /posts => retourne la liste des posts', async () => {
    const response = await makeRequest('/posts');
    expect(response.statusCode).toBe(200);
    expect(response.body.posts.length).toBeGreaterThan(0);
    expect(response.body.posts[0].title).toBe('Titre Test');
  });

  test('POST /posts => création de post', async () => {
    const newPost = {
      title: 'Mon Titre',
      content: 'Contenu de test',
      author: '123',
    };

    const response = await makeRequest('/posts', 'POST', newPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Mon Titre');
  });

  test('GET /posts => 500 si erreur dans BlogPost.find()', async () => {
    const originalFind = BlogPost.find;
    BlogPost.find = jest.fn(() => ({
      populate: jest.fn().mockRejectedValue(new Error('Erreur simulée')),
    }));

    const response = await makeRequest('/posts');
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Erreur simulée');

    BlogPost.find = originalFind;
  });

  test('GET /unknown => 404 Not Found', async () => {
    const response = await makeRequest('/unknown');
    expect(response.statusCode).toBe(404);
  });

  test('MongoDB connection a été appelée', () => {
    expect(mongoose.connect).toHaveBeenCalled();
  });

  test('CORS => refuse un origin non autorisé', async () => {
    const response = await makeRequest('/', 'GET', null, { Origin: 'http://not-allowed.com' });
    expect(response.statusCode).toBe(500);
    expect(response.body).toContain('Not allowed by CORS');
  });
});
