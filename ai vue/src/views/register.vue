<template>
    <div class="container">
        <div class="title">
            <div class="title-text">
                <h2>创建您的账户</h2>
                <p>请填写注册信息</p>
            </div>
    </div>
    <div class="form-container">
        <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="formData.username" placeholder="请输入用户名"  size="large"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" placeholder="请输入邮箱"  size="large"/>
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
                <el-input v-model="formData.nickname" placeholder="请输入昵称(可选)"  size="large"/>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" placeholder="请输入手机号"  size="large"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" placeholder="请输入密码"  size="large" type="password" show-password/>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="formData.confirmPassword" placeholder="请确认密码"  size="large" type="password" show-password/>
            </el-form-item>
            <el-button class="btn" type="primary" size="large" @click="submitForm(submitFormRef)">注册</el-button>
        </el-form>
    </div> 
        
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { register } from '@/api/frontend'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const submitFormRef = ref(null)


const formData = reactive({
    
    "username": "",
    "email": "",
    "nickname": "",
    "phone": "",
    "password": "",
    "confirmPassword": "",
    "gender": 0,
    "userType": 1

})

const rules=reactive(
{
    "username": [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    "password": [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
    "confirmPassword": [
        { required: true, message: '请确认密码', trigger: 'blur' },
    ],
    "email": [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
    ]

    
})

 //表单提交
/*
const submitForm = async (formEl) => {
  if (!formEl) return

  formEl.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息')
      return
    }

    try {
      const postData = {
        username: formData.username,
        email: formData.email,
        nickname: formData.nickname || "",
        phone: formData.phone || "",
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        gender: 1,
        userType: 1
      }

      console.log("发送：", postData)
      const data = await register(postData)
      console.log("返回：", data)

      // ✅ 这里是关键！！！
      // 你的后端成功是：success = true
      if (data.success === true) {
        ElMessage.success("注册成功！")
        router.push("/auth/login")
      } else {
        ElMessage.error(data.msg || "注册失败")
      }

    } catch (err) {
      console.error("报错：", err)
      ElMessage.error("注册失败：系统异常")
    }
  })
}
*/


//表单提交

const submitForm = async (formEl) => {
     if(!formEl) return 
     const postData = {
        ...formData,
        nickname: formData.nickname || "",  // 没填就给 ""
         phone: formData.phone || ""       
}
     formEl.validate(async (valid) => { 
        register(postData).then(({data})=>{
             console.log(data) 
             if(!data){
                 ElMessage.success("注册成功")
                 router.push('/auth/login') 
             }
             if(data.code==="BUSINESS_ERROR"){
                 ElMessage.error(data.message)
             }
        })
  })
}

</script>

<style lang="scss" scoped>
.container {
    width: 384px;
    .flex-box {
        display: flex;
        align-items: center;
    }
    .title {
        .title-text {
            text-align: center;
            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }
            p {
                font-size: 18px;
                color: #6b7280;
            }
        }
    }
    .form-container {
        margin-top: 30px;
        .btn {
            margin-top: 40px;
            width: 100%;
        }
        .footer {
            padding: 30px;
            text-align: center;
        }
    }
}

</style>
