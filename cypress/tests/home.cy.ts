const apiTeams = `${Cypress.env("apiUrl")}/teams`;

describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.reload(true);

    cy.intercept(`${apiTeams}*`, { fixture: 'teams.json' }).as('apiTeams');
    cy.wait('@apiTeams');

    cy.get('select').eq(0).as('conferences');
    cy.get('select').eq(1).as('divisions');
    cy.get('select').eq(2).as('teams');
    cy.get('select').eq(3).as('days');
    cy.get('button').as('trackButton');
  });

  describe('when accessed', () => {
    it('should display title, drop-down lists and track team button', () => {

      cy.get('h1').contains('NBA Score Tracking App').should('exist');

      cy.get('@conferences').within(() => {
        cy.get('option').should($options => {
            const conferences = $options.map((i, el) => Cypress.$(el).text().trim());

            expect(conferences.get()).to.deep.eq([
              '',
              'Eastern conference',
              'Western conference'
            ]);
          })
      });

      cy.get('@divisions').within(() => {
        cy.get('option').should($options => {
            const conferences = $options.map((i, el) => Cypress.$(el).text().trim());

            expect(conferences.get()).to.deep.eq([
              '', 
              'Atlantic division', 
              'Central division', 
              'Southeast division', 
              'Northwest division', 
              'Pacific division', 
              'Southwest division'
            ]);
          })
      });

      cy.get('@teams').within(() => {
        cy.get('option').should($options => {
            expect($options).to.have.length(30);

            const firstTeamFullName = $options.first().text().trim();

            expect(firstTeamFullName).to.equal('Atlanta Hawks (Fake)');
          })
      });

      cy.get('@days').within(() => {
        cy.get('option').should($options => {
          const conferences = $options.map((i, el) => +Cypress.$(el).text().trim());

          expect(conferences.get()).to.deep.eq([6, 12, 20]);
        })
      });

      cy.get('@trackButton').should('exist');

    })
  });
})