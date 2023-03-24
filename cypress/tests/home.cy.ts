type Division = 'Atlantic' | 'Central' | 'Southeast' | 'Northwest' | 'Pacific' | 'Southwest';
type Conference = 'East' | 'West';

interface Team {
  readonly reqId: number;
  readonly index: number;
  readonly name: string;
  readonly abbreviation: string;
  readonly fixture: string;
  readonly division: Division;
  readonly conference: Conference;
}

const apiTeams = `${Cypress.env("apiUrl")}/teams`;
const apiGames = `${Cypress.env("apiUrl")}/games`;
const cardTeamNameSelector = 'h3'

const atlantaHawks: Team = { index: 0, reqId: 1, abbreviation: 'ATL', name: 'Atlanta Hawks (Fake)', fixture: 'atlanta-hawks.json', division: 'Southeast', conference: 'East' };
const brooklynNets: Team = { index: 2, reqId: 3, abbreviation: 'BKN', name: 'Brooklyn Nets', fixture: 'brooklyn-nets.json', division: 'Atlantic', conference: 'East' };
const goldenStateWarriors: Team = { index: 9, reqId: 10, abbreviation: 'GSW', name: 'Golden State Warriors', fixture: 'golden-state-warriors.json', division: 'Pacific', conference: 'West' };
const milwaukeeBucks: Team = { index: 16, reqId: 17, abbreviation: 'MIL', name: 'Milwaukee Bucks', fixture: 'milwaukee-bucks.json', division: 'Central', conference: 'East' };
const minnesotaTimberwolves: Team = { index: 17, reqId: 18, abbreviation: 'MIN', name: 'Minnesota Timberwolves', fixture: 'minnesota-timberwolves.json', division: 'Northwest', conference: 'West' };
const newOrleansPelicans: Team = { index: 18, reqId: 19, abbreviation: 'NOP', name: 'New Orleans Pelicans', fixture: 'new-orleans-pelicans.json', division: 'Southwest', conference: 'West' };

const allTestTeams = [atlantaHawks, brooklynNets, goldenStateWarriors, milwaukeeBucks, minnesotaTimberwolves, newOrleansPelicans];

describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.reload(true);

    cy.intercept(`${apiTeams}*`, { fixture: 'teams.json' }).as('apiTeams');
    cy.wait('@apiTeams');

    cy.intercept('**/*.png', { fixture: 'image.png' });

    cy.intercept(`${apiGames}*`, req => {
      // sample URL: https://free-nba.p.rapidapi.com/games?page=0&dates[]=2023-03-21&dates[]=2023-03-20&dates[]=2023-03-19&dates[]=2023-03-18&dates[]=2023-03-17&dates[]=2023-03-16&dates[]=2023-03-15&dates[]=2023-03-14&dates[]=2023-03-13&dates[]=2023-03-12&dates[]=2023-03-11&per_page=12&team_ids%5B%5D=1
      // Id is to be accessed at last parameter of url after equal sign : team_ids%5B%5D=1
      const reqId = +(req.url.split('=').pop() as string);
      const team = allTestTeams.find(o => o.reqId === reqId);
      const fixture = team ? team.fixture : 'unknown.json';

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

  it('should be able to track teams', () => {

    // First element of list shall be selected by default: Atlanta
    cy.get('@trackButton').click();
    cy.wait('@apiGames');

    checkTrackedTeams(atlantaHawks);

    cy.get('@teams').select(brooklynNets.index);
    cy.get('@trackButton').click();
    cy.wait('@apiGames');

    checkTrackedTeams(
      atlantaHawks,
      brooklynNets);

    cy.get('@teams').select(newOrleansPelicans.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(goldenStateWarriors.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(milwaukeeBucks.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(minnesotaTimberwolves.index);
    cy.get('@trackButton').click();

    cy.wait('@apiGames');
    checkTrackedTeams(
      atlantaHawks,
      brooklynNets,
      newOrleansPelicans,
      goldenStateWarriors,
      milwaukeeBucks,
      minnesotaTimberwolves);
  });

  it('should be able to delete tracked teams', () => {

    cy.get('@teams').select(atlantaHawks.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(brooklynNets.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(goldenStateWarriors.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(milwaukeeBucks.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(minnesotaTimberwolves.index);
    cy.get('@trackButton').click();

    cy.get('@teams').select(newOrleansPelicans.index);
    cy.get('@trackButton').click();

    cy.wait('@apiGames');
    checkTrackedTeams(
      atlantaHawks,
      brooklynNets,
      goldenStateWarriors,
      milwaukeeBucks,
      minnesotaTimberwolves,
      newOrleansPelicans);

    deleteTrackedTeams(goldenStateWarriors);

    checkTrackedTeams(
      atlantaHawks,
      brooklynNets,
      milwaukeeBucks,
      minnesotaTimberwolves,
      newOrleansPelicans);

    deleteTrackedTeams(atlantaHawks, brooklynNets, milwaukeeBucks, minnesotaTimberwolves, newOrleansPelicans);

    checkNoTrackedTeams();
  });

  function checkNoTrackedTeams() {
    cy.get(cardTeamNameSelector).should('not.exist');
  }

  function checkTrackedTeams(...teams: Team[]) {
    const expectedTeams = teams.map(t => `${t.name} [${t.abbreviation}] ×`);

    cy.get(cardTeamNameSelector).should($els => {
      const teams = $els.map((i, el) => Cypress.$(el).text().trim());

      expect(teams.get()).to.deep.equal(expectedTeams);
    });
  }

  function deleteTrackedTeams(...teams: Team[]) {
    teams.forEach(team => {

      cy.get(cardTeamNameSelector).contains(team.name).first().within(() => {
        cy.get('span').click();

      });

      cy.get('dialog:visible').within(() => {
        cy.get('button').contains('Yes').click();
      });
    });
  }
})

