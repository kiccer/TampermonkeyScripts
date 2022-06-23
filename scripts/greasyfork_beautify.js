// ==UserScript==
// @name         Greasyfork Beautify
// @namespace    https://github.com/kiccer
// @version      0.7.alpha
// @description  Greasyfork网站美化。
// @author       kiccer<1072907338@qq.com>
// @supportURL   https://github.com/kiccer/TampermonkeyScripts/issues
// @license      MIT
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/packs/media/images/blacklogo96-b2384000fca45aa17e45eb417cbcbb59.png
// @require      https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @resource less https://cdn.bootcdn.net/ajax/libs/less.js/4.1.3/less.min.js
// @resource normalize.css https://cdn.bootcdn.net/ajax/libs/normalize/8.0.1/normalize.min.css
// @run-at       document-start
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* globals GM_info GM_addStyle GM_getResourceText $ less Vue */

const VERSION = GM_info.script.version

// 自动根据浏览器语言设置当前语言
if (!new RegExp(`/${navigator.language}/?`).test(location.href)) {
    location.href = location.href.replace(/^(https:\/\/greasyfork\.org\/)[a-zA-Z-]+(\/?.*)/, `$1${navigator.language}$2`)
}

window.addEventListener('load', () => {
    // 样式初始化
    GM_addStyle(GM_getResourceText('normalize.css'))
    // eslint-disable-next-line no-eval
    eval(GM_getResourceText('less'))

    const lessOptions = {}

    const lessInput = `
        // --------------------------------------------- 变量

        @nav_height: 60px;
        @user_container_height: 24px;

        // --------------------------------------------- 混合宏

        .ellipsis (@lines) {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.5;
            -webkit-line-clamp: @lines;
        }

        // --------------------------------------------- 通用样式

        * {
            box-sizing: border-box;
            outline: none;
        }

        body {
            line-height: 1.5;
            min-height: 100vh;
            background-color: #f7f7f7;

            > .width-constraint {
                min-height: 100vh;
                background-color: #fff;
                padding: 20px;
                padding-top: calc(@nav_height + @user_container_height + 20px);
                
                .text-content {
                    border: 0;
                    box-shadow: none;
                    padding: 0;
                }
            }
        }

        a {
            color: rgb(38, 38, 38);
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }

            &:visited {
                color: rgb(38, 38, 38);
            }
        }

        // --------------------------------------------- 输入框

        input[type=search] {
            padding: 3px 6px;
            padding-right: 2.4em !important;
            border: 1px solid #bfbfbf;
            border-radius: 4px;
        }

        form {
            input.search-submit {
                top: 50% !important;
                transform: translateY(-50%);
                cursor: pointer;
            }
        }

        .home-search {
            margin-bottom: 20px;
        }

        .sidebar-search {
            margin-bottom: 20px;

            input[type="search"] {
                margin: 0;
            }
        }

        // --------------------------------------------- header

        #main-header {
            background-color: #000;
            background-image: none;
            width: 100%;
            padding: 0;
            position: fixed;
            top: 0;
            z-index: 1;
            user-select: none;
            box-shadow: 0 0 5px 2px rgb(0 0 0 / 50%);

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

            #user-container {
                width: 100%;
                height: @user_container_height;
                background-color: #343434;

                .user-main {
                    margin: auto;
                    max-width: 1200px;
                    height: @user_container_height;
                    line-height: @user_container_height;
                    text-align: right;
                    font-size: 14px;
                    padding-right: 10px;

                    @media screen and (max-width: 1228px) {
                        margin: auto 1.2vw;
                    }
                }
            }
        }

        #site-nav {
            width: 0;
            height: 0;
            border: 0;
            padding: 0;
            overflow: hidden;
            position: relative;
        }

        #site-nav-vue {
            display: flex;
            
            .nav-item {
                line-height: @nav_height;
                padding: 0 10px;
                transition: all .2s ease;
                text-decoration: none;
                position: relative;
                white-space: nowrap;

                &:hover {
                    background-color: rgba(255, 255, 255, .2);

                    .sub-nav {
                        display: flex;
                    }
                }

                .sub-nav {
                    display: none;
                    flex-direction: column;
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background-color: rgba(0, 0, 0, .8);

                    .nav-item {
                        line-height: 40px;
                    }
                }
            }
        }

        // --------------------------------------------- 脚本列表

        #browse-script-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 20px;
            border: 0;
            box-shadow: none;

            li {
                border: 1px solid #bbb;
                box-shadow: 0 0 5px #ddd;
                border-radius: 5px;
                padding: 10px;
                position: relative;

                a.script-link {
                    .ellipsis(2);
                    height: calc(3em  + 8px);
                    font-size: 16px;
                    margin: 4px -10px 4px -14px;
                    padding: 4px 10px;
                    background: linear-gradient(#fff, #eee);
                    border-left: 7px solid #800;
                    box-shadow: inset 0 1px rgb(0 0 0 / 10%), inset 0 -1px rgb(0 0 0 / 10%);
                }

                .script-description {
                    .ellipsis(3);
                    text-indent: 2em;
                    margin: 10px 0 10px;
                    height: 4.5em;
                    font-size: 14px;
                }

                .inline-script-stats {
                    padding-top: 10px;
                    border-top: 1px solid #ebebeb;

                    dt {
                        width: 40%;
                    }

                    dd {
                        width: 60%;
                    }
                }
            }
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

    // 导航
    const navContainer = document.createElement('div')
    navContainer.id = 'site-nav-vue'
    document.querySelector('.width-constraint').appendChild(navContainer)

    // eslint-disable-next-line no-unused-vars
    const nav = new Vue({
        el: '#site-nav-vue',

        template: `
            <div id="site-nav-vue">
                <a
                    class="nav-item"
                    v-for="(nav, nav_i) in navList"
                    :key="nav_i"
                    :href="nav.url"
                >
                    <span>{{ nav.label }}</span>

                    <div class="sub-nav" v-if="nav.list?.length">
                        <a
                            class="nav-item"
                            v-for="(sub, sub_i) in nav.list"
                            :key="sub_i"
                            :href="sub.url"
                        >
                            <span>{{ sub.label }}</span>
                        </a>
                    </div>
                </a>
            </div>
        `,

        data () {
            return {
                navList: [...$('#site-nav > nav > li')].map(n => {
                    const a = $(n).find('> a')
                    const subNav = [...$(n).find('> nav > li')]

                    return {
                        label: a.text(),
                        url: a.attr('href'),
                        list: subNav.map(m => {
                            const subA = $(m).find('> a')

                            return {
                                label: subA.text(),
                                url: subA.attr('href')
                            }
                        })
                    }
                })
            }
        }
    })

    // 用户
    const userContainer = document.createElement('div')
    userContainer.id = 'user-container'
    document.querySelector('#main-header').appendChild(userContainer)

    // eslint-disable-next-line no-unused-vars
    const user = new Vue({
        el: '#user-container',
        template: `
            <div id="user-container">
                <div class="user-main">
                    <a
                        :href="dom.attr('href')"
                    >{{ dom.text() }}</a>

                    <template v-if="isLogin">
                        [<a :href="logoutDom.attr('href')">{{ logoutDom.text() }}</a>]
                    </template>
                </div>
            </div>
        `,

        data () {
            return {
                dom: $('#nav-user-info .user-profile-link a, #nav-user-info .sign-in-link a'),
                logoutDom: $('.sign-out-link a'),
                isLogin: $('.sign-out-link').length > 0 // 存在登出按钮则表示已登录
            }
        }
    })

    // 脚本列表页面
    // if (/^https:\/\/greasyfork\.org\/[a-zA-Z-]+\/scripts$/.test(location.href)) {
    //     $('#browse-script-list li[data-script-id]').each((i, dom) => {
    //         const li = $(dom)
    //         const cardHeader = $('<div class="card-header">')
    //         const score = li.find('dd.script-list-ratings').data('rating-score')
    //         const scoreWrap = $('<span class="score">')
    //         const install = $('<a>')
    //         li.find('> article').before(cardHeader)
    //         cardHeader.append(scoreWrap)
    //         cardHeader.append(install)
    //         scoreWrap.html(score)
    //         install.html('INSTALL')
    //     })
    // }
})
