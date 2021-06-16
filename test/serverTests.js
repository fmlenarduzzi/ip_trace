let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
const Country = require('../models/Country');
const server = require("../src/server");
const config = require('../config/config');

chai.use(chaiHttp);
const url = `http://${config.appHost}:${config.appPort}`;

// IPs for Testing
const UruguayIpOne = "167.62.158.169";
const CanadaIpOne = "192.99.47.146";
const CanadaIpTwo = "142.103.1.1";   //longest


describe('Test IP Trace API ', () => {

    before(() => {
        server.initServer();
    });

    describe('Test /trace endpoint ',() => {

        beforeEach(async () => {
            await Country.remove({});
        });

        it('should get correct result from Uruguay IP', () => {
            chai.request(url)
                .post('/traces')
                .send({
                    ip: UruguayIpOne
                })
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body.ip).to.equals(UruguayIpOne);
                    expect(res.body.name).to.equals('Uruguay');
                    expect(res.body.lat).to.equals(-34.8576);
                    expect(res.body.lon).to.equals(-56.1702);
                    expect(res.body.distance_to_uy).to.equals(0);
                });
        });

        it('should get correct result from Canada IP', () => {
            chai.request(url)
                .post('/traces')
                .send({
                    ip: CanadaIpOne
                })
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body.ip).to.equals(CanadaIpOne);
                    expect(res.body.name).to.equals('Canada');
                    expect(res.body.lat).to.equals(45.5029);
                    expect(res.body.lon).to.equals(-73.5723);
                    expect(res.body.distance_to_uy).to.equals(9105.526620124154);
                });
        });

        it('should save stat data correctly', () => {
            chai.request(url)
                .post('/traces')
                .send({
                    ip: CanadaIpOne
                })
                .end(function (err, res) {});

            chai.request(url)
                .get('/statistics')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body.longest_distance.country).to.equals('Canada');
                    expect(res.body.longest_distance.value).to.equals(9105.526620124154);

                    expect(res.body.most_traced.country.length).to.equals(1);
                    expect(res.body.most_traced.country).to.equals(["Canada"]);
                    expect(res.body.most_traced.country.value).to.equals(1);
                });
        });

        it('should update stat data correctly', () => {
            chai.request(url)
                .post('/traces')
                .send({
                    ip: CanadaIpTwo
                })
                .end(function (err, res) {});

            chai.request(url)
                .get('/statistics')
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body.longest_distance.country).to.equals('Canada');
                    expect(res.body.longest_distance.value).to.equals(18410.956719805254);

                    expect(res.body.most_traced.country.length).to.equals(1);
                    expect(res.body.most_traced.country).to.equals(["Canada"]);
                    expect(res.body.most_traced.country.value).to.equals(2);
                });
        });
    });
});
