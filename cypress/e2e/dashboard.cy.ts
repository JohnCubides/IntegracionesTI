describe('Dashboard E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('debe mostrar el panel de detalle al hacer clic en un ítem', () => {
    cy.get('input[placeholder="Buscar por título o palabra clave..."]')
      .type('test');

    cy.wait(1000);

    cy.get('.mb-3').should('have.length.at.least', 1);

    cy.get('.mb-3', { timeout: 10000 }).should('have.length.at.least', 1);

    cy.get('.mb-3').first().within(() => {
      cy.get('.bg-gray-50').click();
    });

    cy.get('.mb-3').first().find('app-item-detail').should('exist');

    cy.get('h3').contains('Detalle del ítem').should('be.visible');
  });

  it('muestra mensaje cuando no hay resultados', () => {
    cy.visit('/dashboard');

    cy.get('input[placeholder="Buscar por título o palabra clave..."]')
      .type('no-existe');

    cy.contains('No se encontraron resultados para').should('be.visible');
  });

  it('carga la página 2 tras el deep‑link y la búsqueda', () => {
    cy.visit('/dashboard');

    cy.get('input[placeholder="Buscar por título o palabra clave..."]')
      .type('test');
    cy.wait(1000);

    cy.contains('button', 'Siguiente')
      .scrollIntoView()

    // fuerza el click
    cy.contains('button', 'Siguiente')
      .click({ force: true });

    cy.contains('Página 2 de').should('be.visible');
  });

  it('debe ocultar y mostrar la sidebar al hacer click en el toggle', () => {
    cy.get('div.fixed').should('have.class', 'w-64');

    cy.get('button').first().click();
    cy.get('div.fixed').should('have.class', 'w-0');

    cy.get('button').first().click();
    cy.get('div.fixed').should('have.class', 'w-64');
  });
});
