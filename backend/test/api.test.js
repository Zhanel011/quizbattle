const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

const BASE_URL = 'http://localhost:5000';

describe('QuizBattle API Tests', () => {

  // ==================
  // AUTH TESTS
  // ==================
  describe('POST /api/auth/register', () => {
    it('should register a new user', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/register')
        .send({
          email: `testuser${Date.now()}@test.com`,
          password: 'test123',
          username: `testuser${Date.now()}`
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email');
          done();
        });
    });

    it('should not register with duplicate email', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/register')
        .send({
          email: 'admin@quizbattle.com',
          password: 'test123',
          username: 'someuser123'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('should not register with missing fields', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'admin@quizbattle.com',
          password: 'admin123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body.user.role).to.equal('admin');
          done();
        });
    });

    it('should not login with wrong password', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'admin@quizbattle.com',
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Invalid email or password');
          done();
        });
    });

    it('should not login with non-existent email', (done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({
          email: 'notexist@test.com',
          password: 'test123'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  // ==================
  // TOPICS TESTS
  // ==================
  describe('GET /api/topics', () => {
    let token;

    before((done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'admin@quizbattle.com', password: 'admin123' })
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return 401 without token', (done) => {
      chai.request(BASE_URL)
        .get('/api/topics')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return topics with valid token', (done) => {
      chai.request(BASE_URL)
        .get('/api/topics')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(3);
          done();
        });
    });

    it('should return questions for topic', (done) => {
      chai.request(BASE_URL)
        .get('/api/topics/1/questions')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(10);
          done();
        });
    });
  });

  // ==================
  // USERS TESTS
  // ==================
  describe('GET /api/users', () => {
    let token;

    before((done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'admin@quizbattle.com', password: 'admin123' })
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return 401 without token', (done) => {
      chai.request(BASE_URL)
        .get('/api/users')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return all users for admin', (done) => {
      chai.request(BASE_URL)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  // ==================
  // GAMES TESTS
  // ==================
  describe('POST /api/games/create', () => {
    let token;

    before((done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'admin@quizbattle.com', password: 'admin123' })
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should return 401 without token', (done) => {
      chai.request(BASE_URL)
        .post('/api/games/create')
        .send({ topic_id: 1, mode: 'solo' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should create a solo game', (done) => {
      chai.request(BASE_URL)
        .post('/api/games/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ topic_id: 1, mode: 'solo' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          expect(res.body.mode).to.equal('solo');
          done();
        });
    });
  });

  // ==================
  // SECURITY TESTS
  // ==================
  describe('Security Tests', () => {
    let userToken;

    before((done) => {
      chai.request(BASE_URL)
        .post('/api/auth/login')
        .send({ email: 'moderator@quizbattle.com', password: 'mod123' })
        .end((err, res) => {
          userToken = res.body.token;
          done();
        });
    });

    it('moderator should not change role', (done) => {
      chai.request(BASE_URL)
        .put('/api/users/1/role')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });

    it('should return 401 for invalid token', (done) => {
      chai.request(BASE_URL)
        .get('/api/users')
        .set('Authorization', 'Bearer invalidtoken123')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

});