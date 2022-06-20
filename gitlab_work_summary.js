// ==UserScript==
// @name         一键生成 GitLab 周报汇总
// @namespace    https://github.com/kiccer
// @version      0.1
// @description  一键生成 GitLab 周报汇总
// @author       kiccer<1072907338@qq.com>
// @match        http://192.168.1.128:8088/*
// @icon         https://gd-hbimg.huaban.com/690fe61ca630eaffd3e052c73d3aa7d66d45d95a6101-gORZdx_fw658/format/webp
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/bootstrap-daterangepicker/3.1/moment.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/bootstrap-daterangepicker/3.1/daterangepicker.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/clipboard.js/2.0.11/clipboard.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/toastr.js/latest/toastr.min.js
// @resource toastr_css https://cdn.bootcdn.net/ajax/libs/toastr.js/latest/toastr.min.css
// @resource daterangepicker_css https://cdn.bootcdn.net/ajax/libs/bootstrap-daterangepicker/3.1/daterangepicker.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    const targetPath = $('.header-user-dropdown-toggle').attr('href')
    const currentPath = location.pathname
    
    if (targetPath !== currentPath) return

    // 加载 CSS
    GM_addStyle(GM_getResourceText('toastr_css'))
    GM_addStyle(GM_getResourceText('daterangepicker_css'))

    // 按钮容器
    const btnContainer = $('.cover-controls')

    // 一键生成 GitLab 周报汇总
    const copyBtn = $('<a>')
    copyBtn.addClass('btn btn-gray')
    copyBtn.html('一键生成周报')
    copyBtn.appendTo(btnContainer)
    copyBtn.on('click', e => {
        const startTime = moment().subtract(7, 'day').format('YYYY-MM-DD 00:00:00')
        const endTime = moment().format('YYYY-MM-DD 23:59:59')
        const summaryList = getSummary(startTime, endTime)
        const text = getTextBySummary(startTime, endTime, summaryList)

        copy(text)
    })

    // 自定义汇总时间范围
    const customBtn = $('<a>')
    customBtn.addClass('btn btn-gray')
    customBtn.html('自定义时间')
    const dateRange = $('<input type="text" name="daterange" style="display: none;" />')
    customBtn.append(dateRange)
    customBtn.appendTo(btnContainer)
    copyBtn.on('click', e => {

    })

    // 加载页面
    function loadPage () {
        return new Promise((resolve, reject) => {
            const total = $('.event-item').length
            Pager.getOld()

            // 轮询，当条数发生改变时视为加载成功
            const loop = () => {
                setTimeout(() => {
                    if ($('.event-item').length > total) {
                        resolve()
                    } else {
                        loop()
                    }
                }, 100)
            }

            loop()
        })
    }

    // 多查几页记录
    setTimeout(() => {
        Array(5).fill(loadPage).reduce(async (n, m) => {
            await n
            return m()
        }, Promise.resolve())
    }, 1000)

    // 获取汇总列表
    function getSummary (startTime, endTime) {
        const eventItem = $('.event-item')
        const inScoped = []

        // 提取内容
        eventItem.each((index, item) => {
            const it = $(item)
            const time = moment(it.find('time').attr('datetime'))

            if (time >= moment(startTime) && time <= moment(endTime)) {
                inScoped.push({
                    time,
                    project: it.find('.project-name').text(),
                    branch: it.find('.event-title strong a[title]').text(),
                    commit: [...it.find('.event_commits .commit')].map(n =>
                        $(n).text().replace(/^\n\n[0-9a-f]{8}\n·\n\s*(.+)\s*\n\n$/i, '$1')
                    ).filter(n => !/^Merge branch/.test(n))
                })
            }
        })

        // 内容归整
        let project = []

        inScoped.forEach(scope => {
            const projectName = scope.project
            const itemProject = project.find(n => n.name === projectName)

            if (itemProject) {
                const itemBranch = itemProject.branch.find(n => n.name === scope.branch)

                if (itemBranch) {
                    itemBranch.commit.push(scope)
                } else {
                    itemProject.branch.push({
                        name: scope.branch,
                        commit: [scope]
                    })
                }
            } else {
                project.push({
                    name: projectName,
                    branch: [{
                        name: scope.branch,
                        commit: [scope]
                    }]
                })
            }
        })

        // commit 排序后合并成 Array<String> 格式
        project.forEach(n => {
            n.branch.forEach(m => {
                m.commit = m.commit.sort((x, y) => moment(x.time) - moment(y.time))
                    .map(x => x.commit)
                    .flat()
            })
        })

        return project
    }

    // 生成文本汇总信息
    function getTextBySummary (startTime, endTime, summaryList) {
        const res = [
            `周报日期：${startTime.slice(0, 10)} ~ ${endTime.slice(0, 10)}`
        ]

        summaryList.forEach(project => {
            res.push(`\n${project.name}`)

            project.branch.forEach((branch, index) => {
                res.push(`${index ? '\n' : ''}    ${branch.name}`)

                branch.commit.forEach(commit => {
                    res.push(`        ${commit}`)
                })
            })
        })

        res.push('\n总结：\n    ')
        
        return res.join('\n')
    }

    // 拷贝到剪贴板
    function copy (text) {
        const btn = $('<button>')

        btn.attr('data-text', text)

        new ClipboardJS(btn[0], {
            text: trigger => trigger.getAttribute('data-text')
        })

        btn.click()

        toastr.success('复制成功！')
    }
})();