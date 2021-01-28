const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
// describe 테스트를 그룹화해주는 함수
// 유닛 테스트 예시
describe('isLoggedIn', () => {
    const res = { // jest.fn - 가짜 함수, 모킹용, jest.fn(() => 반환값) 형태로 사용
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    const next = jest.fn(); 

    test('로그인되어 있으면 isLoggedIn이 next를 호출해야 함', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);// toBeCalledTimes(숫자) 정확히 몇 번 호출하는지 체크
    });

    test('로그인되어 있지 않으면 isLoggedIn 이 에러를 응답해야함', () => {
        const req = {
          isAuthenticated: jest.fn(() => false),
        };
        isLoggedIn(req, res, next);
        expect(res.status).toBeCalledWith(403); // toBeCalledWith(인수)는 특정 인수와 함께 호출되었는지 체크
        expect(res.send).toBeCalledWith('로그인 필요');
    });
});

describe('isNotLoggedIn', () => {
    const res = {
        redirect: jest.fn(),
    };
    const next = jest.fn();
    test('로그인되어 있으면 isNotLoggedIn이 에러를 응답해야 함', () => {
        const req = {
            isAuthenticated: jest.fn(() => true),
        };
        isNotLoggedIn(req, res, next);
        const message = encodeURIComponent('로그인한 상태입니다.');
        expect(res.redirect).toBeCalledWith(`/?error=${message}`);
    });

    test('로그인되어 있지 않으면 isNotLoggedIn이 next를 호출해야 함', () => {
        const req = {
            isAuthenticated: jest.fn(() => false),
        };
        isNotLoggedIn(req, res, next);
        expect(next).toBeCalledTimes(1);
    });
});

test('1+1은 2입니다.', () => {
    expect(1 + 1).toEqual(2);
});

