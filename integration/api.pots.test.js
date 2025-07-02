const http = require('http');
const app = require('../app');

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

describe('Intégration API Root', () => {
  test('GET / doit retourner Hello World', async () => {
    const response = await makeRequest('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello World');
  });
});
