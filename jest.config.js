module.exports = {
    "transform": {
        ".(ts|tsx)": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
    ],
    "testPathIgnorePatterns": [
        "/node_modules/",
        "<rootDir>/ressource-aggregator/build/",
        "<rootDir>/ressource-aggregator/out/"
    ],
    "verbose": true,
    "testURL": "http://localhost/",
    "coverageDirectory": "coverage/front",
    "coverageReporters": [
        "text",
        "cobertura"
    ],
    "moduleNameMapper": {
        "^@ressource-aggregator(.*)$": "<rootDir>/ressource-aggregator/src/main/resources/public/ts$1",
    }
};
