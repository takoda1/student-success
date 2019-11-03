describe('Home Page Tests', function() {
    it('Adds a new goal and removes it', function() {
        cy.visit('localhost:3005/index')
        cy.get(".addGoalField").type("Study stuff today").should('have.value', 'Study stuff today')
        cy.contains("Add Goal").click()
        cy.get(".addGoalField").should('be.empty')
        cy.contains("Study stuff today").get(".remove").click()
    })

    it("Edits today's reflection", function() {
        cy.visit('localhost:3005/index')
        cy.get(".editReflection").click()
        cy.get("#reflectionField").type("Today I wrote some great tests.").should('have.value', 'Today I wrote some great tests.')
        cy.contains("Submit").click()
        cy.get(".reflections").should("include", "Today I wrote some great tests.")
    })
})
  