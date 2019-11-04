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

    it('Checks the goal and shows all goals completed', function() {
        cy.visit('localhost:3005/index')
        cy.contains("You haven't completed your goals yet, keep it up!")
        cy.get('[type="checkbox"]').check()
        cy.contains("You've completed all of your goals for today! :)")
    }) 

    it('Removes the goal', function() {
        cy.visit('localhost:3005/index')
        cy.contains("Study stuff today. For real").get(".remove").click()
        cy.should("not.contain", "Study stuff today. For real")
    })

    it("Edits today's reflection", function() {
        cy.visit('localhost:3005/index')
        cy.get(".editReflection").click()
        cy.get("#reflectionField").clear().type("Today I wrote some great tests.").should('have.value', 'Today I wrote some great tests.')
        cy.contains("Submit").click()
        cy.contains("Today I wrote some great tests.")
    })

    it("Starts and ends a timer", function() {
        cy.visit('localhost:3005/index').wait(2e3)
        const starting = cy.get("td")
        cy.contains("start").click().wait(5e3)
        cy.contains("pause").click()
        cy.contains("00:29:55")
        cy.contains("submit this time").click()
        cy.get("td").should("not.eq", starting)
    })
})
  