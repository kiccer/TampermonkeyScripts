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

    globals: {
        GM_addStyle: 'readonly',
        GM_addElement: 'readonly',
        GM_deleteValue: 'readonly',
        GM_listValues: 'readonly',
        GM_addValueChangeListener: 'readonly',
        GM_removeValueChangeListener: 'readonly',
        GM_setValue: 'readonly',
        GM_getValue: 'readonly',
        GM_log: 'readonly',
        GM_getResourceText: 'readonly',
        GM_getResourceURL: 'readonly',
        GM_registerMenuCommand: 'readonly',
        GM_unregisterMenuCommand: 'readonly',
        GM_openInTab: 'readonly',
        GM_xmlhttpRequest: 'readonly',
        GM_download: 'readonly',
        GM_getTab: 'readonly',
        GM_saveTab: 'readonly',
        GM_getTabs: 'readonly',
        GM_notification: 'readonly',
        GM_setClipboard: 'readonly',
        GM_info: 'readonly'
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
