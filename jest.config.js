/** Jest se usa acá solo para las funciones puras de src/.
 *  Los tests de API y de UI corren con el runner de Playwright. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests-unit/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
};
