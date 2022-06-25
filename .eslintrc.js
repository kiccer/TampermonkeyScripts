module.exports = {
    env: {
        browser: true,
        es2021: true
    },

    extends: [
        'standard'
    ],

    parserOptions: {
        ecmaVersion: 'latest'
    },

    rules: {
        indent: ['error', 4],
        camelcase: ['error', {
            properties: 'never',
            ignoreGlobals: true,
            ignoreDestructuring: true,
            allow: [
                '_i$'
            ]
        }]
    }
}
