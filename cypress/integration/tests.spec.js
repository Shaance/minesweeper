/// <reference types="cypress" />

describe('Minesweeper app', () => {
  const defaultNumberOfRemainingFlags = 10;
  const defaultNumberOfCells = 64;

  beforeEach(() => {
    cy.visit('http://localhost:5000')
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

  it('Changes the number of cells and remaining flags when selecting another level', () => {
    cy.get('[data-cy=level-picker]').select('Medium')
    cy.get('[data-cy=board]').children().should('not.have.length', defaultNumberOfCells)
    cy.get('[data-cy=remaining-flags]').should('not.have.text', `⛳️  ${defaultNumberOfRemainingFlags}`)
  })

  it('Decreases the number of remaining flags when putting a flag on the board, and increases again when removing flag', () => {
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
})