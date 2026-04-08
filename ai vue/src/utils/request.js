import axios from 'axios'
import { ElMessage } from 'element-plus'


const service = axios.create({
    baseURL: '/api',//请求前缀
    timeout: 5000,//请求超时时间
})
//请求拦截器
service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['token'] = token
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
/*
//响应拦截器
service.interceptors.response.use(
    (response) => {   //响应成功
        const { data, config } = response
        //处理响应数据
        console.log('响应数据:', data);
        // 检查是否是登录请求
        if (config.url?.includes('/login')) {
            // 直接返回整个响应数据，让登录组件自己处理
            return data;
        }
        // 其他请求按原有逻辑处理
        if (data.code === 200) {  //成功
            return data.data
        } else {
            if (data.code === '-1') {
                if (!config.url?.includes('/login')) {

                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    window.location.href = '/auth/login'
                } else {
                    ElMessage.error(data.msg || '登录过期，请重新登录')
                    return Promise.reject('网络请求失败...')
                }
            }
        }
        return response
    },
    (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error)
    }
)

*/

// 响应拦截器（👇 重点修改这里）
service.interceptors.response.use(
    (response) => {
        const { data, config } = response
        console.log('响应数据:', data);

        // 1. 登录请求：返回完整的data
        if (config.url?.includes('/login')) {
            return data;
        }

        // 2. 其他请求：兼容code的字符串/数字类型
        if (String(data.code) === '200') {
            return data.data || [] // 核心：返回业务数组
        }

        // 3. code=-1：登录过期处理
        if (String(data.code) === '-1') {
            if (!config.url?.includes('/login')) {
                // 只在非登录请求时清除token和跳转到登录页
                // 但先检查是否是会话相关的请求，避免发送消息时退出登录
                if (!config.url?.includes('/psychological-chat')) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    window.location.href = '/auth/login'
                } else {
                    ElMessage.error(data.msg || '登录过期，请重新登录')
                }
            } else {
                ElMessage.error(data.msg || '登录过期，请重新登录')
            }
            return [] // 兜底返回空数组
        }

        // 4. 其他code：提示错误 + 返回空数组
        ElMessage.error(data.msg || '请求失败')
        return []
    },
    (error) => {
        console.error('请求错误:', error);
        // 网络错误时不清除token，只显示错误信息
        ElMessage.error('网络异常，请稍后重试')
        return [] // 异常时也返回空数组
    }
)

export default service