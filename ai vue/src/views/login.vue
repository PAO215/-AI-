<template>
    <div class="container">
        <div class="title">
            <div class="back-home">
                <el-icon><Back />  </el-icon>
                <span>返回首页</span>
            </div>
            <div class="title-text">
                <h2>登录账户</h2>
                <p>请输入您的信息</p>
            </div>
        </div>
        <div class="form-container">
            <el-form 
            ref="ruleFormRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            >
            <el-form-item label="用户名/邮箱" prop="username">
                <el-input v-model="formData.username" size="large" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password" show-password />
            </el-form-item>
            <el-button class="btn" size="large" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
            </el-form>
            <div class="footer">
                <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
            </div>
        </div >
    </div>
</template>

<script setup>
import { ref,reactive } from 'vue'
import {login} from '@/api/admin'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const ruleFormRef = ref()

const rules= reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

const formData = reactive({
  username: '',
  password: ''
})


//登录
const submitForm = async (formEl) => {
    if(!formEl) return
    await formEl.validate((valid,fields) => {
       if(valid){
            login(formData).then(data =>{
                console.log('登录响应数据:', data);
                // 检查响应格式
                if(data.token){
                    // 格式1: { token: '...', userInfo: {...} }
                    localStorage.setItem('token',data.token);
                    localStorage.setItem('userInfo',JSON.stringify(data.userInfo || {}));
                    console.log('登录成功！');
                    if(data.userInfo?.userType===2){
                        router.push('/back/dashboard')
                    }
                    else{
                        router.push('/back/dashboard/user')
                    }
                } else if(data.data && data.data.token){
                    // 格式2: { data: { token: '...', userInfo: {...} } }
                    localStorage.setItem('token',data.data.token);
                    localStorage.setItem('userInfo',JSON.stringify(data.data.userInfo || {}));
                    console.log('登录成功！');
                     if(data.data.userInfo?.userType===2){
                        router.push('/back/dashboard')
                    }
                    else{
                        router.push('/back/dashboard')
                    }
                } else {
                    console.error('登录失败：未获取到token');
                    console.error('响应数据:', data);
                }
            }).catch(error => {
                console.error('登录请求失败:', error);
                console.error('错误详情:', error.response ? error.response.data : error.message);
            })
        }
    })

 }
     /*   if(valid){
            login(formData).then(data =>{
                console.log('登录响应数据:', data);
                if(!data.token){
                    return console.error('登录失败:未获取到token');
                }
                //保存token和用户信息
                localStorage.setItem('token',data.token);
                localStorage.setItem('userInfo',JSON.stringify(data.userInfo));
                if(data.userInfo?.userType===2){
                    router.push('/back/dashboard')
                }else{
                    router.push('/back/dashboard/user')
                }
     */

</script>


<style scoped="scss">
.container{
    width: 384px;
    .title{
        .back-home{
            margin-bottom: 60px;
         }
         .title-text{
            text-align: center;
            h2{
                  font-size:36px ;
                  margin-bottom: 60px;
            }
            p{

                font-size: 18px;
                color: #6b7280;
            }    
         }
    }   
    .form-container{
        margin-top:30px;
        .btn{
            width:100%;
             margin-top:40px;
        }
        .footer{
            text-align: center;
            margin-top:30px;
        }
    }
}
</style>