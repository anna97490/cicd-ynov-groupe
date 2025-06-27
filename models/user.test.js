const mockingoose = require('mockingoose');
const model = require('./user');

describe('test mongoose User model', () => {
  it('should return the doc with findById', () => {
    const _doc = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    };

    mockingoose(model).toReturn(_doc, 'findOne');

    return model.findById({ _id: '507f191e810c19729de860ea' }).then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    });
  });

  it('should return the doc with find', () => {
    const _doc = [{
      _id: '507f191e810c19729de860ea',
      name: 'name',
      email: 'name@email.com',
    }];

    mockingoose(model).toReturn(_doc, 'find');

    return model.find({}).then(doc => {
      expect(JSON.parse(JSON.stringify(doc))).toMatchObject(_doc);
    });
  });
});