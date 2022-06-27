// ==UserScript==
// @name         Greasyfork Beautify
// @namespace    https://github.com/kiccer
// @version      1.0.beta.2
// @description  优化导航栏样式 / 脚本列表改为卡片布局 / 代码高亮(atom-one-dark + vscode 风格) 等……融入式美化，自然、优雅，没有突兀感，仿佛页面原本就是如此……（更多优化逐步完善中！）
// @description:en  Optimize the navigation bar style / script list to card layout / code highlighting (atom-one-dark + vscode style), etc. Into the style of beautification, more natural, more elegant, no sense of abruptness, as if the page is originally so. (more optimization in progress!)
// @author       kiccer<1072907338@qq.com>
// @supportURL   https://github.com/kiccer/TampermonkeyScripts/issues
// @license      MIT
// @match        https://greasyfork.org/*
// @icon         https://greasyfork.org/packs/media/images/blacklogo96-b2384000fca45aa17e45eb417cbcbb59.png
// @require      https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/less.js/4.1.3/less.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/highlight.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/languages/javascript.min.js
// @resource normalize.css https://cdn.bootcdn.net/ajax/libs/normalize/8.0.1/normalize.min.css
// @resource atom-one-dark.css https://cdn.bootcdn.net/ajax/libs/highlight.js/11.5.1/styles/atom-one-dark.min.css
// @run-at       document-start
// @grant        GM_info
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/* globals $ less Vue hljs */

const VERSION = GM_info.script.version

// 自动根据浏览器语言设置当前语言
if (!new RegExp(`/${navigator.language}/?`).test(location.href)) {
    location.href = location.href.replace(/^(https:\/\/greasyfork\.org\/)[a-zA-Z-]+(\/?.*)/, `$1${navigator.language}$2`)
}

// 样式注入
GM_addStyle(GM_getResourceText('normalize.css'))
GM_addStyle(GM_getResourceText('atom-one-dark.css'))

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

    // --------------------------------------------- 代码高亮

    .code-container {
        background-color: #282c34;
        border-radius: 8px;
        max-height: 100%;
        overflow: visible;

        // 定义滚动条
        ::-webkit-scrollbar {
            width: 14px;
            height: 14px;
            background-color: transparent;
        }

        // 定义滚动条轨道
        ::-webkit-scrollbar-track {
            background-color: transparent;
        }

        // 定义滑块
        ::-webkit-scrollbar-thumb {
            background-color: rgba(78, 86, 102, 0);
        }

        // 定义边角
        ::-webkit-scrollbar-corner {
            background-color: transparent;
        }

        &:hover {
            ::-webkit-scrollbar-thumb {
                background-color: rgba(78, 86, 102, .5);
            }
        }

        ::selection {
            background-color: rgb(51, 56, 66);
        }

        pre {
            code {
                padding: 0;
                font-family: Consolas;
                cursor: text;
                overflow: auto;

                .marker {
                    display: inline-block;
                    color: #636d83;
                    text-align: right;
                    padding-right: 20px;
                    user-select: none;
                    cursor: auto;
                }
            }
        }
    }

    // --------------------------------------------- 页码

    .pagination {
        margin-top: 20px !important;
        user-select: none;

        > * {
            padding: 0 .5em !important;
            min-width: 2em;
            height: 2em;
            line-height: 2;
            text-align: center;
            text-decoration: none !important;
        }

        > a {
            background-color: #f7f7f7 !important;

            &:hover {
                background-color: #e1e1e1 !important;
            }
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
                    }
                }
            }
        }

        #user-container {
            width: 100%;
            height: @user_container_height;
            background-color: #343434;

            .user-main {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: auto;
                max-width: 1200px;
                height: @user_container_height;
                padding-right: 10px;

                @media screen and (max-width: 1228px) {
                    margin: auto 1.2vw;
                }

                .script-version {
                    font-size: 12px;
                    letter-spacing: 1px;
                    font-family: "微软雅黑";
                    font-weight: 200;
                    color: rgba(255, 255, 255, .3);
                }

                .login-info {
                    font-size: 14px;
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

    #user-script-list,
    #user-deleted-script-list,
    #browse-script-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 20px;
        border: 0;
        box-shadow: none;

        @media screen and (max-width: 1228px) {
            grid-template-columns: repeat(1, 1fr);
        }

        li {
            border: 1px solid #bbb;
            box-shadow: 0 0 5px #ddd;
            border-radius: 5px;
            padding: 10px;
            position: relative;
            word-break: break-all;

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

            .install-link {
                float: right;
                font-size: 12px;

                &:hover {
                    transition: box-shadow .2s;
                    box-shadow: 0 8px 16px 0 rgb(0 0 0 / 20%), 0 6px 20px 0 rgb(0 0 0 / 19%);
                }

                &.loading::before {
                    content: "";
                    padding-left: 18px;
                    background-image: url("https://raw.githubusercontent.com/kiccer/TampermonkeyScripts/master/static/img/loading.webp");
                    background-size: 100% 100%;
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

// 查看代码页面简化，隐藏信息
if (/https:\/\/greasyfork\.org\/[a-zA-Z-]+\/scripts\/\d{6}-.+\/code/.test(location.href)) {
    GM_addStyle(`
        #script-info header,
        #install-area,
        #script-feedback-suggestion {
            display: none;
        }

        #script-content {
            margin-top: 16px;
        }

        .code-container pre code {
            max-height: calc(100vh - 267px);
        }
    `)
}

// GreasyFork 的源代码，直接拷过来
const {
    checkForUpdatesJS
} = (() => {
    function getTampermonkey () {
        return window.external?.Tampermonkey
    }

    function getViolentmonkey () {
        return window.external?.Violentmonkey
    }

    function getInstalledVersion (name, namespace) {
        return new Promise(function (resolve, reject) {
            const tm = getTampermonkey()
            if (tm) {
                tm.isInstalled(name, namespace, function (i) {
                    if (i.installed) {
                        resolve(i.version)
                    } else {
                        resolve(null)
                    }
                })
                return
            }

            const vm = getViolentmonkey()
            if (vm) {
                vm.isInstalled(name, namespace).then(resolve)
                return
            };

            reject(Error)
        })
    }

    // https://developer.mozilla.org/en/docs/Toolkit_version_format
    function compareVersions (a, b) {
        if (a === b) {
            return 0
        }
        const aParts = a.split('.')
        const bParts = b.split('.')
        for (let i = 0; i < aParts.length; i++) {
            const result = compareVersionPart(aParts[i], bParts[i])
            if (result !== 0) {
                return result
            }
        }
        return 0
    }

    function compareVersionPart (partA, partB) {
        const partAParts = parseVersionPart(partA)
        const partBParts = parseVersionPart(partB)
        for (let i = 0; i < partAParts.length; i++) {
            // "A string-part that exists is always less than a string-part that doesn't exist"
            if (partAParts[i].length > 0 && partBParts[i].length === 0) {
                return -1
            }
            if (partAParts[i].length === 0 && partBParts[i].length > 0) {
                return 1
            }
            if (partAParts[i] > partBParts[i]) {
                return 1
            }
            if (partAParts[i] < partBParts[i]) {
                return -1
            }
        }
        return 0
    }

    // It goes number, string, number, string. If it doesn't exist, then
    // 0 for numbers, empty string for strings.
    function parseVersionPart (part) {
        if (!part) {
            return [0, '', 0, '']
        }
        const partParts = /([0-9]*)([^0-9]*)([0-9]*)([^0-9]*)/.exec(part)
        return [
            partParts[1] ? parseInt(partParts[1]) : 0,
            partParts[2],
            partParts[3] ? parseInt(partParts[3]) : 0,
            partParts[4]
        ]
    }

    function handleInstallResult (installButton, installedVersion, version) {
        if (installedVersion == null) {
            // Not installed, do nothing
            return
        }

        installButton.removeAttribute('data-ping-url')

        switch (compareVersions(installedVersion, version)) {
        // Upgrade
        case -1:
            installButton.textContent = installButton.getAttribute('data-update-label')
            break
            // Downgrade
        case 1:
            installButton.textContent = installButton.getAttribute('data-downgrade-label')
            break
            // Equal
        case 0:
            installButton.textContent = installButton.getAttribute('data-reinstall-label')
            break
        }
    }

    function checkForUpdatesJS (installButton, retry) {
        const name = installButton.getAttribute('data-script-name')
        const namespace = installButton.getAttribute('data-script-namespace')
        const version = installButton.getAttribute('data-script-version')

        getInstalledVersion(name, namespace).then(function (installedVersion) {
            handleInstallResult(installButton, installedVersion, version)
        }, function () {
            if (retry) {
                setTimeout(function () { checkForUpdatesJS(installButton, false) }, 1000)
            }
        })
    }

    // function checkForUpdatesCSS (installButton) {
    //     const name = installButton.getAttribute('data-script-name')
    //     const namespace = installButton.getAttribute('data-script-namespace')
    //     postMessage({ type: 'style-version-query', name, namespace, url: location.href }, location.origin)
    // }

    // Response from Stylus
    // window.addEventListener('message', function (event) {
    //     if (event.origin !== 'https://greasyfork.org' && event.origin !== 'https://sleazyfork.org') { return }

    //     if (event.data.type !== 'style-version') { return }

    //     const installButton = document.querySelector('.install-link[data-install-format=css]')
    //     if (installButton == null) { return }

    //     const version = installButton.getAttribute('data-script-version')

    //     const installedVersion = event.data.version

    //     handleInstallResult(installButton, installedVersion, version)
    // }, false)

    // document.addEventListener('DOMContentLoaded', function () {
    //     const installButtonJS = document.querySelector('.install-link[data-install-format=js]')
    //     if (installButtonJS) {
    //         checkForUpdatesJS(installButtonJS, true)
    //     }
    //     const installButtonCSS = document.querySelector('.install-link[data-install-format=css]')
    //     if (installButtonCSS) {
    //         checkForUpdatesCSS(installButtonCSS)
    //     }
    // })

    return {
        checkForUpdatesJS
    }
})()

// 页面加载完成后执行
$(() => {
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
                        label: a.text() || $(n).text(),
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
                    <div class="script-version">
                        Greasyfork Beautify V${VERSION}
                    </div>

                    <div class="login-info">
                        <a
                            :href="dom.attr('href')"
                        >{{ dom.text() }}</a>

                        <template v-if="isLogin">
                            [<a :href="logoutDom.attr('href')">{{ logoutDom.text() }}</a>]
                        </template>
                    </div>
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

    // 代码高亮
    $('pre.lang-js').each((pre_i, pre) => {
        // 调整代码，给一些压缩代码增加换行
        $(pre).find('li').append('\n')
        const code = $('<code class="language-javascript">').html(
            pre.innerHTML
        )

        // 清空原始代码容器，放置新容器
        $(pre)
            .removeClass()
            .html('')
            .append(code)

        // 高亮
        hljs.highlightElement(pre.querySelector('code'))

        // 增加行号
        const html = $(pre).find('code').html()
        const htmlSplit = html.split('\n')
        const totalLines = htmlSplit.length

        $(pre).find('code').html(
            htmlSplit.map((n, i) => `<span class="marker" style="width: calc(${String(totalLines).length * 0.5}em + 20px);">${i + 1}</span>${n}`).join('\n')
        )
    })

    // 脚本列表页面，卡片
    $(`
        #user-script-list li[data-script-id],
        #user-deleted-script-list li[data-script-id],
        #browse-script-list li[data-script-id]
    `).each((i, n) => {
        const card = $(n)
        const href = card.find('> article a.script-link').attr('href')

        // TODO 显示脚本图标 (看情况，如果加了图标不好布局就算了)

        // 信息占位
        card.find('.inline-script-stats').append(`
            <dt class="script-show-version"><span>...</span></dt>
            <dd class="script-show-version"><span></span></dd>
        `)

        // 下载按钮占位
        card.append(`
            <a class="install-link loading"></a>
        `)

        $.ajax({
            type: 'get',
            url: href,
            success: res => {
                const html = $(res)

                // 删除占位元素
                card.find('.script-show-version').remove()
                card.find('.install-link.loading').remove()

                // 版本
                card.find('.inline-script-stats').append(
                    html.find('.script-show-version')
                )

                // 下载按钮
                card.append(
                    html.find('#install-area .install-link').eq(0).addClass('install-link-copy')
                )

                // 下载按钮文案根据已安装的版本号调整
                setTimeout(() => {
                    checkForUpdatesJS(card.find('.install-link-copy')[0], true)
                })
            }
        })
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
