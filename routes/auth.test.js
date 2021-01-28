// 통합테스트는 하나의 라우터에 여러개 미들웨어가 붙어있고 다양한 라이브러리를 사용하는 상황을 모두 유기적으로 잘 작동하는지 테스트 하는 것
// 통합테스트는 데이터베이스를 모킹하지 않고 실제로 데이터를 쌓기 때문에 테스트용 데이터베이스를 새로 만드는것이 좋다

const request = require('supertest');
const { sequelize } = require('../models');
const app = require('../app');

beforeAll(async () => { // 테스트 실행 전 수행하는 함수, 이외에 afterAll(모든 테스트 끝난 후), beforeEach(각각의 테스트 수행 전), afterEach(각각의 테스트 수행 후) 등이 있다.
    await sequelize.sync(); // 테이블 생성
});

// supertest 패키지에서 request 함수 불러와 app객체를 인수로 넣음
// get, post, put, patch, delete 등 전부 가능 
// data는 send 메서드에 담아 보내고 예상 응답을 expect 메서드 인수로 제공하면 값 일치 여부 테스트
// done을 두 번째 인수로 넣어서 마무리 해야함

describe('POST /join', () => {
    test('로그인 안 했으면 가입', (done) => {
        request(app)
            .post('/auth/join')
            .send({
                email: 'par333k@naver.com',
                nick: 'parkjw',
                password: '1234',
            })
            .expect('Location', '/')
            .expect(302, done);
    });
});

describe('POST /join', () => {
    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post('/auth/login')
            .send({
                email: 'par333k@naver.com',
                password: '1234',
            })
            .end(done);
    });
    test('이미 로그인 했으면 redirect /', (done) => {
        const message = encodeURIComponent('로그인한 상태입니다.');
        agent
            .post('/auth/join')
            .send({
                email: 'par333k@naver.com',
                nick: 'parkjw',
                password: '1234',
            })
            .expect('Location', `/?error=${message}`)
            .expect(302, done);
    });
});

describe('POST /login', () => {
    test('가입되지 않은 회원', async (done) => {
        const message = encodeURIComponent('가입되지 않은 회원입니다.');
        request(app)
            .post('/auth/login')
            .send({
                email: 'par333k1@naver.com',
                password: '1234',
            })
            .expect('Location', `/?loginError=${message}`)
            .expect(302, done);
    });

    test('로그인 수행', async (done) => {
        request(app)
            .post('/auth/login')
            .send({
                email: 'par333k@naver.com',
                password: '1234',
            })
            .expect('Location', '/')
            .expect(302, done);
    });

    test('비밀번호 틀림', async (done) => {
        const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
            request(app)
                .post('/auth/login')
                .send({
                    email: 'par333k@naver.com',
                    password: 'wrong',
                })
                .expect('Location', `/?loginError=${message}`)
                .expect(302, done);
    });
});

describe('GET /logout', () => {
    test('로그인되어 있지 않으면 403', async (done) => {
        request(app)
            .get('/auth/logout')
            .expect(403, done);
    });

    const agent = request.agent(app);
    beforeEach((done) => {
        agent
            .post('/auth/login')
            .send({
                email: 'par333k@naver.com',
                password: '1234',
            })
            .end(done);
    });

    test('로그아웃 수행', async (done) => {
        const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
            agent
                .get('/auth/logout')
                .expect('Location', '/')
                .expect(302, done);
    });
});

// 테스트가 다 끝나면 더미데이터를 삭제해야 함
// 테이블을 다시 만드는 것
afterAll(async () => {
    await sequelize.sync({ force: true });
});