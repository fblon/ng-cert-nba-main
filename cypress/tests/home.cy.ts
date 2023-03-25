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

const atlantaHawks: Team = { index: 0, reqId: 1, abbreviation: 'ATL', name: 'Atlanta Hawks (Fake)', fixture: 'atlanta-hawks', division: 'Southeast', conference: 'East' };
const brooklynNets: Team = { index: 2, reqId: 3, abbreviation: 'BKN', name: 'Brooklyn Nets', fixture: 'brooklyn-nets', division: 'Atlantic', conference: 'East' };
const goldenStateWarriors: Team = { index: 9, reqId: 10, abbreviation: 'GSW', name: 'Golden State Warriors', fixture: 'golden-state-warriors', division: 'Pacific', conference: 'West' };
const milwaukeeBucks: Team = { index: 16, reqId: 17, abbreviation: 'MIL', name: 'Milwaukee Bucks', fixture: 'milwaukee-bucks', division: 'Central', conference: 'East' };
const minnesotaTimberwolves: Team = { index: 17, reqId: 18, abbreviation: 'MIN', name: 'Minnesota Timberwolves', fixture: 'minnesota-timberwolves', division: 'Northwest', conference: 'West' };
const newOrleansPelicans: Team = { index: 18, reqId: 19, abbreviation: 'NOP', name: 'New Orleans Pelicans', fixture: 'new-orleans-pelicans', division: 'Southwest', conference: 'West' };

const allTestTeams = [atlantaHawks, brooklynNets, goldenStateWarriors, milwaukeeBucks, minnesotaTimberwolves, newOrleansPelicans];

type Days = 6 | 12 | 20;

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
      const reqId = +(getUrlParameterValue(req.url, 'team_ids'));
      const numberOfDays = +(getUrlParameterValue(req.url, 'per_page'));
      const team = allTestTeams.find(o => o.reqId === reqId);
      const fixture = team ? team.fixture : 'unknown';

      req.reply({ fixture: `games/${fixture}.${numberOfDays}.json` });
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

    checkTeamsSizeAndSelected(30, atlantaHawks);

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

    checkTeamsSizeAndSelected(30, atlantaHawks);
    checkDivisionsSizeAndSelected(7, undefined);

    changeDivision(atlantaHawks.division);

    checkTeamsSizeAndSelected(5, atlantaHawks);
    checkDivisionsSizeAndSelected(7, atlantaHawks.division);

    changeConference(atlantaHawks.conference);

    checkTeamsSizeAndSelected(5, atlantaHawks);
    checkDivisionsSizeAndSelected(4, atlantaHawks.division);

    changeDivision(brooklynNets.division);
    changeTeam(brooklynNets);

    changeConference(goldenStateWarriors.conference);
    checkDivisionsSizeAndSelected(4, undefined);
    checkTeamsSize(15);
    changeTeam(goldenStateWarriors);

    changeConference(milwaukeeBucks.conference);
    changeDivision(milwaukeeBucks.division);
    changeTeam(milwaukeeBucks);

    changeConference(undefined);
    checkDivisionsSizeAndSelected(7, milwaukeeBucks.division);
    checkTeamsSizeAndSelected(30, milwaukeeBucks);

    changeDivision(undefined);
    changeTeam(minnesotaTimberwolves);

    changeDivision(minnesotaTimberwolves.division);
    changeConference(minnesotaTimberwolves.conference);
    changeTeam(minnesotaTimberwolves);
  });

  it('should keep tracking time align with number of days', () => {

    trackTeams(atlantaHawks);
    checkStats(12, atlantaHawks);

    changeNumberOfDays(20);

    trackTeams(brooklynNets);
    checkStats(20, atlantaHawks, brooklynNets);

    changeNumberOfDays(6);
    checkStats(6, atlantaHawks, brooklynNets);

    trackTeams(minnesotaTimberwolves);
    checkStats(6, atlantaHawks, brooklynNets, minnesotaTimberwolves);
  })

  function changeTeam(team: Team) {
    cy.get('@teams').select(team.name);

  }

  function changeDivision(division: Division | undefined) {
    const text = division ? division as string : '';

    cy.get('@divisions').select(text);
  }

  function changeConference(conference: Conference | undefined) {
    const text = conference ? conference as string : '';

    cy.get('@conferences').select(text);
  }

  function changeNumberOfDays(days: Days) {
    cy.get('@days').select(days.toString());
  }

  function trackTeams(...teams: Team[]) {
    teams.forEach(team => {
      changeTeam(team);
      cy.get('@trackButton').click();
    });

    cy.wait('@apiGames');
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

  function checkTeamsSizeAndSelected(expectedTeamLength: number, expectedSelectedTeam: Team) {
    checkTeamsSize(expectedTeamLength);

    cy.get('@teams').find('option:selected').should('contain.text', expectedSelectedTeam.name);
  }

  function checkTeamsSize(expectedTeamLength: number) {
    cy.get('@teams').within(() => {
      cy.get('option').should($options => {
        expect($options).to.have.length(expectedTeamLength);
      })
    });
  }

  function checkDivisionsSizeAndSelected(expectedDivisionLength: number, expectedSelectedDivision: Division | undefined) {

    if (!expectedSelectedDivision) {
      cy.get('@divisions').find('option:selected').should('have.text', '');
    }
    else {
      cy.get('@divisions').find('option:selected').should('contain.text', expectedSelectedDivision);
    }

    cy.get('@divisions').within(() => {
      cy.get('option').should($options => {
        expect($options).to.have.length(expectedDivisionLength);
      })
    });
  }

  function checkStats(expectedNumberOdDays: Days, ...teams: Team[]) {
    teams.forEach(team => {
      cy.get('.card').and('contain', team.name).first().within(() => {
        cy.contains(`Results of past ${expectedNumberOdDays} days:`);
        cy.get('mark').should('have.length', expectedNumberOdDays);
      })
    });
  }

  function getUrlParameterValue(url: string, parameter: string): string {
    const paramAndValue = url.split('&').filter(o => o.includes(parameter))[0];
    return paramAndValue.split('=')[1];
  }
})

