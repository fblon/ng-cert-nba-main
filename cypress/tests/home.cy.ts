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

    checkTeamsSizeAndSelected(atlantaHawks, 30);

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

    trackTeams(brooklynNets);

    checkTrackedTeams(atlantaHawks, brooklynNets);

    trackTeams(newOrleansPelicans, goldenStateWarriors, milwaukeeBucks, minnesotaTimberwolves);

    checkTrackedTeams(atlantaHawks, brooklynNets, newOrleansPelicans, goldenStateWarriors, milwaukeeBucks, minnesotaTimberwolves);
  });

  it('should be able to delete tracked teams', () => {

    trackTeams(...allTestTeams);

    checkTrackedTeams(...allTestTeams);

    deleteTrackedTeams(goldenStateWarriors);

    checkTrackedTeams(atlantaHawks, brooklynNets, milwaukeeBucks, minnesotaTimberwolves, newOrleansPelicans);

    deleteTrackedTeams(atlantaHawks, brooklynNets, milwaukeeBucks, minnesotaTimberwolves, newOrleansPelicans);

    checkNoTrackedTeams();
  });

  it('should enable filtering by division and conference', () => {

    checkTeamsSizeAndSelected(atlantaHawks);
    checkDivisionsSizeAndSelected(atlantaHawks.division);

    changeDivision(atlantaHawks.division);

    checkTeamsSizeAndSelected(atlantaHawks, 5);
    checkDivisionsSizeAndSelected(atlantaHawks.division);

    changeConference(atlantaHawks.conference);

    checkTeamsSizeAndSelected(atlantaHawks, 5);
    checkDivisionsSizeAndSelected(atlantaHawks.division, 4);

    changeDivision(brooklynNets.division);
    changeTeam(brooklynNets);

    changeConference(goldenStateWarriors.conference);
    changeDivision(goldenStateWarriors.division);
    changeTeam(goldenStateWarriors);

    changeConference(milwaukeeBucks.conference);
    changeDivision(milwaukeeBucks.division);
    changeTeam(milwaukeeBucks);

    changeConference();
    changeDivision();
    changeTeam(minnesotaTimberwolves);

    changeDivision(minnesotaTimberwolves.division);
    changeConference(minnesotaTimberwolves.conference);
    changeTeam(minnesotaTimberwolves);
  });

  function checkTeamsSizeAndSelected(expectedSelectedTeam: Team, expectedTeamLength: number = 30) {
    cy.get('@teams').within(() => {
      cy.get('option').should($options => {
        expect($options).to.have.length(expectedTeamLength);

        const firstTeamFullName = $options.first().text().trim();

        expect(firstTeamFullName).to.equal(expectedSelectedTeam.name);
      })
    });

  }

  function checkDivisionsSizeAndSelected(expectedSelectedDivision: Division | undefined, expectedDivisionLength: number = 7) {

    if (!expectedSelectedDivision) {
      cy.get('@divisions').first().should('be.empty');
      return;
    }

    cy.get('@divisions').contains(expectedSelectedDivision).should('exist');

    cy.get('@divisions').within(() => {
      cy.get('option').should($options => {
        expect($options).to.have.length(expectedDivisionLength);
      })
    });
  }

  function changeTeam(team: Team) {
    cy.get('@teams').select(team.name);

  }

  function trackTeams(...teams: Team[]) {
    teams.forEach(team => {
      changeTeam(team);
      cy.get('@trackButton').click();
    });

    cy.wait('@apiGames');
  }

  function changeDivision(division: Division | '' = '') {
    if (!division) {
      cy.get('@conferences').select('');
    }

    cy.get('@divisions').select(division as string);
  }

  function changeConference(conference: Conference | '' = '') {
    if (!conference) {
      cy.get('@conferences').select('');
    }
    cy.get('@conferences').select(conference as string);
  }

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

