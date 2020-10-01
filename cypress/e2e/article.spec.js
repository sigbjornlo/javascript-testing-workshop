import '@testing-library/cypress/add-commands';

// lorem kan brukes til å generere tilfeldig tekst.
//
// lorem.generateWords(1)
// lorem.generateSentences(2)
//
// NB! Dette er ikke noe som følger med Cypress, men vi har satt opp disse
// hjelpefunksjonene i /cypress/support/* slik at de er tilgjengelig for alle
// Cypress-testene i dette prosjektet

const username = 'J.K. Rowling';
const title = lorem.generateWords(2);
const tags = lorem.generateWords(3);

describe('Article', () => {
  before(() => {
    cy.server();

    cy.route({
      method: 'POST',
      url: '/articles',
    }).as('postArticles');

    cy.route({
      method: 'DELETE',
      url: '/articles/*',
    }).as('deleteArticles');
  });

  it('can publish an article, find it in global feed, and delete it', () => {
    cy.visit('/');

    cy.findByPlaceholderText('Enter a username').type(username);

    cy.findByText('Register').click();

    cy.findByText(/Add article/i).click();
    cy.findByPlaceholderText(/Article title/i).type(title);
    cy.findByPlaceholderText(/write your article/i).type(
      lorem.generateSentences(2)
    );
    cy.findByPlaceholderText(/enter tags/i).type(tags);
    cy.findByText(/Publish article/i).click();

    cy.wait('@postArticles').then((xhr) => {
      expect(xhr.status).to.equal(200);
      const response = xhr.response;
      expect(response.body.author.username).to.equal(username);
      expect(response.body.title).to.equal(title);

      const id = response.body.id;

      cy.findByText(/Global feed/i).should('exist');
      cy.findByText(title)
        .closest('.article-preview')
        .find('.btn-outline-danger')
        .click();

      cy.wait('@deleteArticles').then((xhr) => {
        expect(xhr.url).to.contain(id);
        expect(xhr.status).to.equal(200);
      });
    });
  });
});
