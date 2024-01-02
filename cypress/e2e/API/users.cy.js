import { postRequestBody, putRequestBody } from '../../fixtures/ApiTestData.json'


describe('API project CRUD operations', () => {

    let userId
   

    beforeEach(function () {


        cy.fixture('ApiTestData').then((data) => {
            this.firstName = data.postRequestBody.firstName
            this.lastName = data.postRequestBody.lastName
            this.email = data.postRequestBody.email
            this.dob = data.postRequestBody.dob

            this.upFirstName = data.putRequestBody.firstName
            this.upLastName = data.putRequestBody.lastName
            this.upEmail = data.putRequestBody.email
            this.upDob = data.putRequestBody.dob

        })
    })

    it('POST new user', function () {
        cy.request({
            method: 'POST',
            url: Cypress.env('baseUrl'),
            body: postRequestBody

        }).then((response) => {
            expect(response.status).to.equal(200)
            expect(response.duration).to.be.below(200)

            cy.log(JSON.stringify(response.body, null, 2))

            cy.validateResponse(response, postRequestBody)

            userId = response.body.id
        })

        cy.task('runQuery', `SELECT * FROM student WHERE email = \'testtest@gmail.com\' `).then((rows) => {

            expect(rows).to.have.length(1)

        })

    })


    it('GET user', function () {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('baseUrl')}/${userId}`
        }).then((response) => {
            cy.log(JSON.stringify(response.body, null, 2))
            expect(response.status).to.equal(200)
            expect(response.duration).to.be.below(200)

        })

        cy.task('runQuery', `SELECT * FROM student WHERE id = ${userId}`).then((rows) => {

            const alice = rows[0]

            const expectedValues = [this.dob, this.email, this.firstName, this.lastName]

            expectedValues.forEach((value, index) => {
                expect(alice[index + 1]).to.equal(value)
            })
        })
    })

    it('update user using PUT', function () {
        cy.request({
            method: 'PUT',
            url: `${Cypress.env('baseUrl')}/${userId}`,
            body: putRequestBody
        }).then((response) => {

            cy.log(JSON.stringify(response.body, null, 2))
            expect(response.status).to.equal(200)
            expect(response.duration).to.be.below(200)
            cy.validateResponse(response, putRequestBody)
        })

        cy.task('runQuery', `SELECT * FROM student WHERE id = ${userId}`).then((rows) => {

            expect(rows).to.have.length(1)

        })
    })

    it('GET user after update', function () {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('baseUrl')}/${userId}`
        }).then((response) => {
            cy.log(JSON.stringify(response.body, null, 2))
            expect(response.status).to.equal(200)
            expect(response.duration).to.be.below(200)

        })

        cy.task('runQuery', `SELECT * FROM student WHERE id = ${userId}`).then((rows) => {

            const alice = rows[0]

            const expectedValues = [this.upDob, this.upEmail, this.upFirstName, this.upLastName]

            expectedValues.forEach((value, index) => {
                expect(alice[index + 1]).to.equal(value)
            })
        })
    })



    it('delete user', () => {
        cy.request({
            method: 'DELETE',
            url: `${Cypress.env('baseUrl')}/${userId}`
        }).then((response => {
            expect(response.status).to.equal(200)
            expect(response.duration).to.be.below(200)
        }))

        cy.task('runQuery', `SELECT * FROM student WHERE id = ${userId}`).then((rows) => {

            expect(rows).to.have.length(0)
        })
    })

    it('GET user after DELETE', () => {
        cy.request({
            method: 'GET',
            url: `${Cypress.env('baseUrl')}/${userId}`,
            failOnStatusCode: false

        }).then((response) => {
            expect(response.status).to.equal(404)

        })
    })
})