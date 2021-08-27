/// <reference types="cypress" />

describe('Minesweeper app', () => {
  const defaultNumberOfRemainingFlags = 10;
  const defaultNumberOfCells = 64;

  before(() => {
    cy.visit(Cypress.env().BASE_URL)
  })

  afterEach(() => {
    // reset the board without having to load the whole page again
    cy.get('[data-cy=level-picker]').select('Easy')
  })

  it('displays the elements correctly', () => {
    cy.get('[data-cy=title]').should('have.text', 'MineSweeper')
    cy.get('[data-cy=instructions]').should('have.text', 'Avoid the 💣💥')
    cy.get('[data-cy=reset-btn]').should('have.text', 'Reset')
    cy.get('[data-cy=remaining-flags]').should('have.text', `⛳️  ${defaultNumberOfRemainingFlags}`)
    cy.get('[data-cy=timer]').should('have.text', '⏳  000')
    cy.get('[data-cy=board]').children().should('have.length', defaultNumberOfCells)
    cy.get('[data-cy=commands-txt]').should('have.text', 'Left click to reveal cell content or right click to flag / unflag')
  })

  it('changes the number of cells and remaining flags when selecting another level', () => {
    cy.get('[data-cy=level-picker]').select('Medium')
    cy.get('[data-cy=board]').children().should('not.have.length', defaultNumberOfCells)
    cy.get('[data-cy=remaining-flags]').should('not.have.text', `⛳️  ${defaultNumberOfRemainingFlags}`)
  })

  it('decreases the number of remaining flags when putting a flag on the board, and increases again when removing flag', () => {
    cy.get('[data-cy=board]').children().first().as('firstCell')
    cy.get('@firstCell').rightclick().then(() => {
      cy.get('[data-cy=remaining-flags]').should('have.text', `⛳️  ${defaultNumberOfRemainingFlags - 1}`)
      cy.get('@firstCell').contains('⛳️')
    })
    cy.get('@firstCell').rightclick().then(() => {
      cy.get('[data-cy=remaining-flags]').should('have.text', `⛳️  ${defaultNumberOfRemainingFlags}`)
      cy.get('@firstCell').should('not.contain', '⛳️')
    })
  })

  it('should start timer on left click and stops when clicking on reset, loosing or changing levels', () => {
    cy.get('[data-cy=board]').children().first().as('firstCell')
    cy.get('@firstCell').rightclick().then(() => {
      cy.get('[data-cy=timer]').should('have.text', '⏳  000')
      cy.get('@firstCell').rightclick()
    })
    cy.get('@firstCell').click().then(() => {
      cy.get('[data-cy=timer]').should('not.have.text', '⏳  000')
      cy.get('[data-cy=level-picker]').select('Medium')
      cy.get('[data-cy=timer]').should('have.text', '⏳  000')
    })
    cy.get('[data-cy=level-picker]').select('Easy').then(() => {
      cy.get('[data-cy=reset-btn]').click()
      cy.get('[data-cy=timer]').should('have.text', '⏳  000')
    })
  })

  it('should disable a cell after click and will not allow flag', () => {
    cy.get('[data-cy=board]').children().first().as('firstCell')
    cy.get('@firstCell').click().then(() => {
      cy.get('@firstCell').children().first().should('have.attr', 'disabled')
      cy.get('@firstCell').rightclick()
      cy.get('@firstCell').should('not.contain', '⛳️')
    })
  })

  it('does not allow putting more flag than the number shown', () => {
    let remainingFlags = defaultNumberOfRemainingFlags;
    cy.get('[data-cy=board]').children().each((cell) => {
      cy.wrap(cell).as('currentCell')
      cy.get('@currentCell').rightclick();
      remainingFlags -= 1;
      if (remainingFlags >= 0) {
        cy.get('@currentCell').contains('⛳️')
      } else {
        cy.get('@currentCell').should('not.contain', '⛳️')
      }
    })
  })
})