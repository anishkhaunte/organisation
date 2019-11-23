var chai     = require('chai');
var chaiHttp = require('chai-http');
var debug    = require("debug");
var _        = require('lodash');
var Promise  = require('bluebird');

var server = require('../index.js');

var should = chai.should();
chai.use(chaiHttp);
var truncate =require('./truncate.js');

describe('normal', function() {

    before((done)=>{
        
        console.log(truncate);
        Promise.resolve(server).then((x)=> {
            server = x;
            done();
        })
    });

    it('create organization tree post', function(done){
        let orderTree = {
            "org_name": "Test Paradise Island",
            "daughters": [
              {
                "org_name": "Test Banana tree",
                "daughters": [
                  {
                    "org_name": "Test Yellow Banana"
                  },
                  {
                    "org_name": "Test Black Banana"
                  }
                ]
              }
            ]
          }
        chai.request(server)
            .post('/api/organization')
            .send(orderTree)
            .end(function(err, res){
                res.should.have.status(200);
                res.body.status.should.be.eql('Organization tree created successfully');
                done();
            });
    });

    it('it should return 0 organizations', (done) => {
        let queryParams = {offset:0, organization_id: 500};
        chai.request(server)
        .get('/api/organization?'+'offset='+ queryParams.offset+'&organization_id='+queryParams.organization_id)
        .end((err, res) => {
              res.should.have.status(400);
              res.body.message.should.be.eql("BADREQUEST");
              res.body.errors.should.be.eql("Organization tree not found.");
          done();
        });
    });

    it('it should GET all the organizations', (done) => {
        let queryParams = {offset:0, organization_name: 'Test Banana tree'};
        chai.request(server)
        .get('/api/organization?'+'offset='+ queryParams.offset+'&organization_name='+queryParams.organization_name)
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('totalCount');
              res.body.should.have.property('moreAvailable');
              res.body.organizations.should.be.a('array');
          done();
        });
    });

    it('No duplicate organizations allowed', function(done){
      let orderTree = {
          "org_name": "Test Paradise Island",
          "daughters": [
            {
              "org_name": "Test Banana tree",
              "daughters": [
                {
                  "org_name": "Test Yellow Banana"
                }
              ]
            }
          ]
        }
        chai.request(server)
          .post('/api/organization')
          .send(orderTree)
          .end(function(err, res){
              res.body.message.should.be.eql('The company name is already in use');
              done();
          });
    });

});
