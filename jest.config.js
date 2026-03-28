/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // Allow plain .js test files (dataLoader.test.js) to run alongside .ts files
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: ".*\\.test\\.(js|ts)$",
}
