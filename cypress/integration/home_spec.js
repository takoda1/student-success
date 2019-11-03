import { faCandyCane } from "@fortawesome/free-solid-svg-icons"

describe('Home Page Tests', function() {
    it('Adds a new goal', function() {
        cy.visit('localhost:3005/index')
        cy.get(".addGoalField").type("Study stuff today").should('have.value', 'Study stuff today')
        cy.contains("Add Goal").click()
        cy.get(".addGoalField").should('be.empty')
    })

    it('Edits the goal', function() {
        cy.visit('localhost:3005/index')
        cy.contains("Study stuff today").get(".edit").click()
        cy.get(".goalField").should('have.value', 'Study stuff today')
        cy.get(".goalField").type(". For real.")
        cy.get(".goalField").should('have.value', 'Study stuff today. For real.')
        cy.contains("Update").click()
        cy.contains("Study stuff today. For real.")
    })

    it('Removes the goal', function() {
        cy.visit('localhost:3005/index')
        cy.contains("Study stuff today. For real").get(".remove").click()
        cy.should("not.contain", "Study stuff today. For real")
    })

    it("Edits today's reflection", function() {
        cy.visit('localhost:3005/index')
        cy.get(".editReflection").click()
        cy.get("#reflectionField").type("Today I wrote some great tests.").should('include.value', 'Today I wrote some great tests.')
        cy.contains("Submit").click()
        cy.contains("Today I wrote some great tests.")
    })
})
  