const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos} = require('./seed/seed');

beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', user[0].tokens[0].token)
            .send({text})
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });

    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', user[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => {
                    done(e);
                })
            });
    });

    describe('GET /todos', () => {
        it('should get all todos', (done) => {
          request(app)
              .get('/todos')
              .set('x-auth', user[0].tokens[0].token)
              .expect(200)
              .expect((res) => {
                  expect(res.body.todos.length).toBe(1);
              })
              .end(done);
        });
    });

    describe('GET /todos/:id', () => {
        it('should return todo doc', (done) => {
            request(app)
                .get(`/todos/${todos[0]._id.toHexString()}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(todos[0].text);
                })
                .end(done);
        });

        it('should return 404 if todo not found', (done) => {
            var hexId = new ObjectID().toHexString();
            request(app)
                .get(`/todos/${hexId}`)
                .expect(404)
                .end(done);
        });

        it('should return for non-object ids', (done) => {
            request(app)
                .get('/todos/123abc')
                .expect(400)
                .end(done);
        })
    });
});