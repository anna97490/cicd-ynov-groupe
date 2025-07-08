const request = require("supertest");
const app = require("../app");
const mockingoose = require("mockingoose");

const User = require("../models/user");
const BlogPost = require("../models/blogPost");

describe("Tests de l'application via app.js", () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  // -------------------------
  // GET /
  // -------------------------

  it("GET / should return Hello World", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello World");
  });

  // -------------------------
  // USERS
  // -------------------------

  describe("Users", () => {
    it("GET /users should return all users", async () => {
      const users = [
        { _id: "1", name: "Alice", email: "alice@email.com" },
        { _id: "2", name: "Bob", email: "bob@email.com" }
      ];

      mockingoose(User).toReturn(users, "find");

      const res = await request(app).get("/users");
      expect(res.statusCode).toBe(200);
      expect(res.body.utilisateurs).toHaveLength(2);
      expect(res.body.utilisateurs[0].email).toBe("alice@email.com");
    });

    it("POST /users should create a user", async () => {
      const user = { _id: "1", name: "Test", email: "test@email.com" };
      mockingoose(User).toReturn(user, "create");

      const res = await request(app)
        .post("/users")
        .send({ name: "Test", email: "test@email.com" });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe("test@email.com");
    });
  });

  // -------------------------
  // POSTS
  // -------------------------
  
  describe("Posts", () => {
    it("GET /posts with authorEmail should return posts", async () => {
      const author = { _id: "1", name: "Alice", email: "alice@email.com" };
      const post = {
        _id: "101",
        title: "Post 1",
        content: "Test",
        author: "alice@email.com",
        date: new Date().toISOString()
      };

      mockingoose(User).toReturn(author, "findOne");
      mockingoose(BlogPost).toReturn([post], "find");

      const res = await request(app)
        .get("/posts?authorEmail=alice@email.com");

      expect(res.statusCode).toBe(200);
      expect(res.body.posts[0].title).toBe("Post 1");
      expect(res.body.posts[0].author).toBe("alice@email.com");
    });

    it("POST /posts should create a blog post", async () => {
      const newPost = {
        _id: "999",
        title: "New Blog",
        content: "Content",
        author: "author@email.com",
        date: new Date().toISOString()
      };

      mockingoose(BlogPost).toReturn(newPost, "save");

      const res = await request(app)
        .post("/posts")
        .send({
          title: "New Blog",
          content: "Content",
          author: "author@email.com"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe("New Blog");
    });
  });
});
