const apiTeams = `${Cypress.env("apiUrl")}/teams`;

describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.reload(true);

    cy.intercept(`${apiTeams}*`, { fixture: 'teams.json' }).as('teams');
    cy.wait('@teams');
  });

  describe('when accessed', () => {
    it('should display title', () => {
      cy.get('h1').contains('NBA Score Tracking App').should('exist');
    });
  
    it.only('should display teams drop-down list', () => {
      cy.get('select').eq(2).within(() => {
        cy.get('option').should($options => {
            expect($options).to.have.length(30);

            const firstTeamFullName = $options.first().text().trim();

            expect(firstTeamFullName).to.equal('Atlanta Hawks (Fake)');
          })
      });
    })
  });
})