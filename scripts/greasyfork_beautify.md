### 导航 navList 的格式

```js
navList: [
    {
        label: '脚本列表',
        url: '/zh-CN/scripts'
    },
    {
        label: '论坛',
        url: '/zh-CN/discussions'
    },
    {
        label: '站点帮助',
        url: '/zh-CN/help'
    },
    {
        label: '更多',
        list: [
            {
                label: '高级搜索',
                url: '/zh-CN/search'
            },
            {
                label: '用户列表',
                url: '/zh-CN/users'
            },
            {
                label: '库',
                url: '/zh-CN/scripts/libraries'
            },
            {
                label: '管理日志',
                url: '/zh-CN/moderator_actions'
            }
        ]
    }
]
```