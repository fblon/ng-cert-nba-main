const apiTeams = `${Cypress.env("apiUrl")}/teams`;
const apiGames = `${Cypress.env("apiUrl")}/games`;
const cardTeamNameSelector = 'h3'

describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.reload(true);

    cy.intercept(`${apiTeams}*`, { fixture: 'teams.json' }).as('apiTeams');
    cy.wait('@apiTeams');

    cy.intercept(`${apiGames}*`, req => {
      let fixture = 'unknown.json'

      // sample URL: https://free-nba.p.rapidapi.com/games?page=0&dates[]=2023-03-21&dates[]=2023-03-20&dates[]=2023-03-19&dates[]=2023-03-18&dates[]=2023-03-17&dates[]=2023-03-16&dates[]=2023-03-15&dates[]=2023-03-14&dates[]=2023-03-13&dates[]=2023-03-12&dates[]=2023-03-11&per_page=12&team_ids%5B%5D=1
      // Id is to be accessed at last parameter of url after equal sign : team_ids%5B%5D=1
      switch (req.url.split('=').pop()) {
        case '1': {
          fixture = 'atlanta-hawks.json'; // Eastern conference, southeast division
          break;
        }
        case '3': {
          fixture = 'brooklyn-nets.json'; // Eastern conference, atlantic division
          break;
        }
        case '10': {
          fixture = 'golden-state-warriors.json'; // Wester conference, pacific division
          break;
        }
        case '17': {
          fixture = 'milwaukee-bucks.json'; // Eastern conference, central division
          break;
        }
        case '18': {
          fixture = 'minnesota-timberwolves.json'; // Wester conference, northwest division
          break;
        }
        case '19': {
          fixture = 'new-orleans-pelicans.json'; // Wester conference, southwest division
          break;
        }
      }

      req.reply({ fixture: `games/${fixture}` });
    }).as('apiGames');

    cy.get('select').eq(0).as('conferences');
    cy.get('select').eq(1).as('divisions');
    cy.get('select').eq(2).as('teams');
    cy.get('select').eq(3).as('days');
    cy.get('button.primary').as('trackButton');
  });

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

  });

  it('should enable tracking team', () => {

    // First element of list shall be selected by default: Atlanta
    cy.get('@trackButton').click();
    cy.wait('@apiGames');

    checkTrackedTeams('Atlanta Hawks (Fake) [ATL] ×');

    cy.get('@teams').select(2);
    cy.get('@trackButton').click();
    cy.wait('@apiGames');

    checkTrackedTeams(
      'Atlanta Hawks (Fake) [ATL] ×',
      'Brooklyn Nets [BKN] ×');

    cy.get('@teams').select(18);
    cy.get('@trackButton').click();

    cy.get('@teams').select(9);
    cy.get('@trackButton').click();

    cy.get('@teams').select(16);
    cy.get('@trackButton').click();

    cy.get('@teams').select(17);
    cy.get('@trackButton').click();

    cy.wait('@apiGames');
    checkTrackedTeams(
      'Atlanta Hawks (Fake) [ATL] ×',
      'Brooklyn Nets [BKN] ×',
      'New Orleans Pelicans [NOP] ×',
      'Golden State Warriors [GSW] ×',
      'Milwaukee Bucks [MIL] ×',
      'Minnesota Timberwolves [MIN] ×');
  });

  function checkTrackedTeams(...expectedTeams: string[]) {
    cy.get(cardTeamNameSelector).should($els => {
      const teams = $els.map((i, el) => Cypress.$(el).text().trim());

      expect(teams.get()).to.deep.equal(expectedTeams);
    });
  }
})

