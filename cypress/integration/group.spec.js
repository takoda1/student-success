describe('Group Page Tests', function() {
    beforeEach(() => {
        cy.visit('localhost:3005/group');
    });

    it('succesfully logs in', function() {
        cy.get('.sign-in').click();
    });

    it('succesfully loads', function() {
        cy.visit('localhost:3005/group');
    });

    it('contains correct titles', function() {
        cy.get('.shared-goals h2').contains("Today's Shared Goals for Group ");
        cy.get('.group-chat h2').contains('Group Chat');
    });
    it('can toggle between goals, timers, and reflections', function() {
        cy.get('.form-control-select').select('Timers');
        cy.get('.shared-goals h2').contains('Timers');
        cy.get('.form-control-select').select('Reflections');
        cy.get('.shared-goals h2').contains('Reflections');
        cy.get('.form-control-select').select('Goals');
        cy.get('.shared-goals h2').contains('Goals');
    });

    it('can send a message in the group chat', function() {
        const msg = "Testing cypress messaging";
        cy.get('.message-input').type(msg);
        cy.get('#group-chat-button').click();
        cy.get('.group-message').last().contains(msg);
    });
});