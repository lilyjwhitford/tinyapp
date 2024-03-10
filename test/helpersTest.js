const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const expect = chai.expect;
const { getUserByEmail } = require("../helpers.js");

chai.use(chaiHttp);

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = testUsers["userRandomID"];
    assert.deepEqual(user, expectedUserID);
  });

  it('if an email is not in our database it should return undefined', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    assert.strictEqual(user, null);
  });
});

describe('Login and Access Control Tests', () => {
  let agent = chai.request.agent('http://localhost:8080');


  it('should redirect GET / to /login with status 302 if user is not logged in', () => {
    return agent
      .get('/').redirects(0)
      .end((err, res, body) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo('/login');
        expect(res).to.have.status(302);
      });
  });

  it('should redirect GET /urls/new to /login with status 302 if user in not logged in', () => {
    return agent
      .get('/urls/new').redirects(0)
      .end((err, res, body) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo('/login');
        expect(res).to.have.status(302);
      });
  });

  it('should return 404 for GET /urls/NOTEXISTS', () => {
    return agent
      .get('/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  it('should return 403 for GET /urls/b2xVn2', () => {
    return agent
      .get('/urls/b2xVn2')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});