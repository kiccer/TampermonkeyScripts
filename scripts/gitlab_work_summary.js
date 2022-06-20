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

/* globals $ GM_addStyle GM_getResourceText moment Pager ClipboardJS toastr */

(function () {
    'use strict'

    const targetPath = $('.header-user-dropdown-toggle').attr('href')
    const currentPath = location.pathname

    // 判断是否是目标地址
    if (targetPath !== currentPath) return

    // 加载 CSS
    GM_addStyle(GM_getResourceText('toastr_css'))
    GM_addStyle(GM_getResourceText('daterangepicker_css'))
    GM_addStyle(`
        .kiccer-daterange-input {
            visibility: hidden;
            width: 0;
            height: 32px;
            border: 0;
            padding: 0;
            margin: 0;
            position: absolute;
        }
    `)

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
    customBtn.appendTo(btnContainer)
    customBtn.on('click', e => {
        dateRange.click()
    })

    // 日期选择期
    const dateRange = $('<input type="text" name="daterange" class="kiccer-daterange-input" />')
    customBtn.append(dateRange)
    dateRange.on('click', e => {
        e.stopPropagation()
    })
    $('input[name="daterange"]').daterangepicker({
        opens: 'left',
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' - ',
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '从',
            toLabel: '至',
            customRangeLabel: '自定义',
            weekLabel: '周',
            daysOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    }, (start, end, label) => {
        // 循环加载页面直到满足指定获取完日期范围的数据
        const loop = async () => {
            const lastEventItemTime = moment($('.event-item:last time').attr('datetime'))

            if (lastEventItemTime < start) {
                const startTime = start.format('YYYY-MM-DD 00:00:00')
                const endTime = end.format('YYYY-MM-DD 23:59:59')
                const summaryList = getSummary(startTime, endTime)
                const text = getTextBySummary(startTime, endTime, summaryList)

                copy(text)
            } else {
                await loadPage()
                loop()
            }
        }

        loop()
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
        const project = []

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

        // eslint-disable-next-line no-new
        new ClipboardJS(btn[0], {
            text: trigger => trigger.getAttribute('data-text')
        })

        btn.click()

        toastr.success('复制成功！')
    }
})()
