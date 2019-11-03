describe('My First Test', function() {
    it('Adds a new goal and removes it', function() {
        cy.visit('localhost:3005/index')
        cy.get(".addGoalField").type("Study stuff today").should('have.value', 'Study stuff today')
        cy.contains("Add Goal").click()
        cy.get(".addGoalField").should('be.empty')
        cy.contains("Study stuff today").get(".remove").click()
    })
})
  