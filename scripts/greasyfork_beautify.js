// ==UserScript==
// @name         Greasyfork Beautify
// @namespace    https://github.com/kiccer
// @version      0.1
// @description  Greasyfork网站美化。
// @author       kiccer<1072907338@qq.com>
// @license      MIT
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/packs/media/images/blacklogo96-b2384000fca45aa17e45eb417cbcbb59.png
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @resource less https://cdn.bootcdn.net/ajax/libs/less.js/4.1.3/less.min.js
// @resource normalize.css https://cdn.bootcdn.net/ajax/libs/normalize/8.0.1/normalize.min.css
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* globals GM_addStyle GM_getResourceText less */

const VERSION = '0.1'

;(() => {
    // 样式初始化
    GM_addStyle(GM_getResourceText('normalize.css'))
    // eslint-disable-next-line no-eval
    eval(GM_getResourceText('less'))

    const lessOptions = {}

    const lessInput = `
        // --------------------------- 通用样式
        * {
            box-sizing: border-box;
            outline: none;
        }

        body {
            background-color: #fff;
        }

        // --------------------------- header
        #main-header {
            background-color: #000;
            background-image: none;
            width: 100%;
            height: 60px;
            padding: 0;
            position: fixed;
            top: 0;
            z-index: 1;

            .width-constraint {
                display: flex;
                justify-content: space-between;
                height: 100%;
                padding: 0;

                #site-name {
                    display: flex;
                    align-items: center;
                    
                    a {
                        display: block;
                    }

                    img {
                        width: auto;
                        height: 50px;
                    }

                    #site-name-text {
                        margin-left: 10px;

                        h1 {
                            font-size: 36px;
                            display: flex;
                            display: flex;
                            align-items: baseline;

                            &::after {
                                content: "Greasyfork Beautify V${VERSION}";
                                font-size: 12px;
                                letter-spacing: 1px;
                                font-family: "微软雅黑";
                                font-weight: 200;
                                color: rgba(255, 255, 255, .5);
                                line-height: 1;
                                margin-left: 10px;
                            }
                        }
                    }
                }
            }
        }

        nav nav {
            background-color: #000;
        }

        // --------------------------- bodyer
        .width-constraint {
            padding-top: 60px;
        }
    `

    less.render(lessInput, lessOptions).then(output => {
        // output.css = string of css
        // output.map = string of sourcemap
        // output.imports = array of string filenames of the imports referenced

        GM_addStyle(output.css)
    }, err => {
        console.error(err)
    })
})()
