import Moment from 'moment';
const todaysDate = Moment().format('MM/DD/YY');
const modifiedDate = Moment().format('MM/DD');
const year = Moment().format('/YY');
describe('History Page Tests', function() {
    beforeEach(() => {
        cy.visit('localhost:3005/history');
    });

    it('logs in', function() {
        cy.get('.sign-in').click();
    });
    
    it('succesfully loads', function() {
        cy.visit('localhost:3005/history');
    });

    it('contains title with correct date', function() {
        cy.get('h1').contains('History for ' + todaysDate);
    });

    it('contains all the days of week', function() {
        cy.get('.btn-toolbar').contains('Sunday');
        cy.get('.btn-toolbar').contains('Monday');
        cy.get('.btn-toolbar').contains('Tuesday');
        cy.get('.btn-toolbar').contains('Wednesday');
        cy.get('.btn-toolbar').contains('Thursday');
        cy.get('.btn-toolbar').contains('Friday');
        cy.get('.btn-toolbar').contains('Saturday');
    });

    it('contains all the major elements', function() {
        cy.get('.history-goals-aside').contains(modifiedDate);
        cy.get('.history-goal-list').contains('Goals');
        cy.get('.history-timers').contains('Timers');
        cy.get('.history-reflections').contains('Reflections');
        cy.get('.history-graph');
    });

    it('updates and includes goals added on home page', function() {
        cy.visit('localhost:3005/index');
        cy.get('.addGoalField').type('History page test');
        cy.contains('Add Goal').click();
        cy.visit('localhost:3005/history');
        cy.get('.history-goals').contains('History page test');
    });

    it('updates and includes reflections added on home page', function() {
        var reflection1 = 'History test reflection 1';
        var reflection2 = 'History test reflection 2';
        var reflection3 = 'History test reflection 3';
        cy.visit('localhost:3005/index');
        cy.get('.editReflection').click();
        cy.get('.questionOne').clear().type(reflection1);
        cy.get('.questionTwo').clear().type(reflection2);
        cy.get('.questionThree').clear().type(reflection3);
        cy.get('.save-reflection').click();
        cy.visit('localhost:3005/history');
        cy.get('.history-reflections').contains('1. ' + reflection1);
        cy.get('.history-reflections').contains('2. ' + reflection2);
        cy.get('.history-reflections').contains('3. ' + reflection3);
        cy.visit('localhost:3005/index');
        cy.get('.editReflection').click();
        cy.get('.questionOne').clear();
        cy.get('.questionTwo').clear();
        cy.get('.questionThree').clear();
        cy.get('.save-reflection').click();
        cy.visit('localhost:3005/history');
        cy.get('.history-reflections').contains('No reflection');
    });

    // it('updates date when new date is clicked', function() {
    //     cy.get('.history-date').first().click();
    //     cy.get('.history-date').eq(0).invoke('text').wait(700).should((text1) => {
    //         expect('h1').contains('History for ' + text1.slice(-5) + year);
    //     });
    // });
});