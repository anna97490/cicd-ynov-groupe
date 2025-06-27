const mongoose   = require('mongoose');
const mockingoose = require('mockingoose');
const BlogPost    = require('../models/blogPost'); 


describe('Mongoose BlogPost model (schéma simplifié)', () => {
  afterEach(() => mockingoose.resetAll());

  it('should return the doc with findById', async () => {
    const _doc = {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
      title: 'Test Title',
      content: 'This is a blog post content.',
      author: 'Alice Dupont',
      date: new Date('2025-06-27T10:00:00Z')
    };

    mockingoose(BlogPost).toReturn(_doc, 'findOne');

    const doc = await BlogPost.findById('60d21b4667d0d8992e610c85');
    expect(doc.toObject()).toMatchObject(_doc);
  });
});


it('should return an array of docs with find', async () => {
  const _docs = [
    {
      _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
      title: 'First post',
      content: 'Lorem ipsum',
      author: 'Bob',
      date: new Date('2025-06-26T08:00:00Z')
    },
    {
      _id: new mongoose.Types.ObjectId('70e32b5768e1e9003f7fc44d'),
      title: 'Second post',
      content: 'Dolor sit amet',
      author: 'Alice',
      date: new Date('2025-06-27T09:30:00Z')
    }
  ];

  mockingoose(BlogPost).toReturn(_docs, 'find');

  const docs = await BlogPost.find({});

  const result = docs.map(doc => doc.toObject());

  expect(result).toMatchObject(_docs);
});


  it('should create a new BlogPost (save)', async () => {
    const _doc = {
      title: 'Create test',
      content: 'Create content',
      author: 'Tester',
      date: new Date()
    };

    mockingoose(BlogPost).toReturn(_doc, 'save');

    const created = await BlogPost.create(_doc);
    expect(created.title).toBe('Create test');
    expect(created.author).toBe('Tester');
  });

