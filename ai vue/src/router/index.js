import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontendLayout from '@/components/FrontendLayout.vue'
//前台
const frontendRoutes = [
    {
        path: '/',
        component: FrontendLayout,
        children: [
            {
                path: '',
                component: () => import('@/views/home.vue'),

            },
            {
                path: 'consultation',
                component: () => import('@/views/consultation.vue'),

            },
            {
                path: 'emotion-diary',
                component: () => import('@/views/emotionDiary.vue'),

            },
            {
                path: 'knowledge',
                component: () => import('@/views/frontendKnowledge.vue'),

            },
            {
                path: 'knowledge/article/:id',
                component: () => import('@/views/articleDetail.vue'),
                props: true

            },
        ]
    }
]

//后台
const backendRoutes = [
    /* {
         path: '/',
         redirect: '/auth/login'
     },*/
    {
        path: '/back',
        redirect: '/back/dashboard',
        component: BackendLayout,
        children: [
            //菜单路由
            {
                path: 'dashboard',
                component: () => import('@/views/dashboard.vue'),
                meta: {
                    title: '数据分析',
                    icon: 'PieChart',
                }
            },
            {
                path: 'knowledge',
                component: () => import('@/views/knowledge.vue'),
                meta: {
                    title: '知识文章',
                    icon: 'ChatLineSquare',
                }
            },
            {
                path: 'consultations',
                component: () => import('@/views/consultations.vue'),
                meta: {
                    title: '咨询记录',
                    icon: 'Message',
                }
            },
            {
                path: 'emotional',
                component: () => import('@/views/emotional.vue'),
                meta: {
                    title: '情绪日志',
                    icon: 'User',
                }
            },
        ]
    },
    //登录路由
    {
        path: '/auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                component: () => import('@/views/login.vue'),
                meta: {
                    title: '登录',

                }
            },
            {
                path: 'register',
                component: () => import('@/views/register.vue'),
                meta: {
                    title: '注册',

                }
            }
        ]
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes: [...frontendRoutes, ...backendRoutes]
})
/*
// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo')

    if (to.path === '/') {
        return next()
    }

    // 已登录
    if (token && userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr)

            if (to.path.startsWith('/auth')) {
                return next()
            }

            // 管理员
            if (userInfo.userType === 2) {
                to.path.startsWith('/back') ? next() : next('/back/dashboard')
            }
            // 普通用户禁止访问后台页面
            else if (userInfo.userType === 1) {
                to.path.startsWith('/back') ? next('/auth/login') : next()
            } else {
                next('/auth/login')
            }
        } catch (e) {
            localStorage.clear()
            next('/auth/login')
        }
    }
    // 未登录
    else {
        if (to.path.startsWith('/auth')) {
            next()
        } else if (to.path.startsWith('/back')) {
            next('/auth/login')
        } else {
            next()
        }
    }
})*/
//路由前置守卫
/*
router.beforeEach((to, from, next) => {

    const token = localStorage.getItem('token')
    //判断是否登录
    if (token) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        //如果是后台用户
        if (userInfo.userType == 2) {
            if (to.path.startsWith('/back')) {
                next()
            } else {
                next('/back/dashboard')
            }
        } else if (userInfo.userType == 1) {
            if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
                next('/')
            } else {
                next()
            }
        }
    } else {
        if (to.path.startsWith('/back')) {
            //如果是后台页面则跳转到登录页面
            next('/auth/login')
        } else {
            next('/auth/register')
        }
    }
}
)
*/
/*router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (token && to.path.startsWith('/auth')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        // 管理员
        if (userInfo.userType == 2) {
            if (to.path.startsWith('/back')) {
                next()
            } else {
                next('/back/dashboard')
            }
        }
        // 普通用户
        else if (userInfo.userType == 1) {
            if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
                next('/')
            } else {
                next()
            }
        }
    }
    // 未登录
    else {
        // 
        if (to.path.startsWith('/back')) {
            next('/auth/login')
        }
        // 允许访问首页、登录、注册
        else if (to.path === '/' || to.path.startsWith('/auth')) {
            next()
        }
        // 其他页面需要登录
        else {
            next('/auth/login')
        }
    }
})
    */
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo')

    // 未登录状态
    if (!token || !userInfoStr) {
        // 后台页面必须登录
        if (to.path.startsWith('/back')) {
            return next('/auth/login')
        }
        // 登录/注册页允许访问
        if (to.path.startsWith('/auth')) {
            return next()
        }
        // 其他前台页面（/consultation 等）允许访问
        return next()
    }

    // 已登录状态
    const userInfo = JSON.parse(userInfoStr)

    // 【管理员】userType = 2
    if (userInfo.userType == 2) {
        // 访问登录/注册页 → 去后台首页
        if (to.path.startsWith('/auth')) {
            return next('/back/dashboard')
        }
        // 访问前台页面（/ /consultation 等）→ 也去后台首页
        if (!to.path.startsWith('/back')) {
            return next('/back/dashboard')
        }
        // 访问后台 → 放行
        return next()
    }

    // 【普通用户】userType = 1
    if (userInfo.userType == 1) {
        // 访问登录/注册页 → 去前台首页
        if (to.path.startsWith('/auth')) {
            return next('/')
        }
        // 访问后台 → 去前台首页
        if (to.path.startsWith('/back')) {
            return next('/')
        }
        // 访问前台（/ /consultation /emotion-dairy 等）→ 放行
        return next()
    }

    // 异常情况
    localStorage.clear()
    next('/auth/login')
})
export default router
