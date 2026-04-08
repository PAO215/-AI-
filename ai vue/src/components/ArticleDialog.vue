<template>
    <el-dialog
        :title="isEdit?'编辑文章':'新增文章'"
        v-model="dialogVisible"
        width="50%"
        @close="handleClose"
    >
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120ppx">
            <el-form-item label="文章标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入标题" maxlength="200"
                 show-word-limit clearable />
            </el-form-item>
            <el-form-item label="分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择分类">
                    <el-option v-for="item in props.categories" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input type="textarea" v-model="formData.summary" placeholder="请输入摘要(可选)" maxlength="1000"
                 show-word-limit clearable :rows="4" />
            </el-form-item>
            <el-form-item label="文章标签" prop="tags">
                <el-select  v-model="formData.tagsArray" placeholder="请输入标签(逗号分隔)" 
                filterable allow-create clearable multiple style="width: 100%;">
                <el-option v-for="tag in commonTags" :key="tag" :value="tag" />
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                        <el-upload
                        class="avatar-uploader"
                        action="#"
                        :before-upload="beforeUpload"
                        :http-request="handleUpLoadRequest"
                        :show-file-list="false"
                        accept="image/*"
                        >
                        <div v-if="!imgUrl" class="cover-placeholder">
                            <p>点击上传封面</p>
                        </div>
                        <img v-else :src="imgUrl" class="cover-image" alt="封面图片">
                    </el-upload>
                    <div v-if="imgUrl" class="cover-remove">
                        <el-button type="danger" size="mini" @click="handleRemove">删除</el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
                <RichTextEditor
                 v-model="formData.content"
                 placeholder="请输入文章内容"
                 :maxCharCount="5000"
                 @change="handleContentChange"
                 @created="handleEditorCreated"
                 min-height="400px"
                 />
            </el-form-item>
            <div v-if="btnPreview">
              <h3>预览文章内容</h3>
                <div v-html="formData.content"></div>
            </div>
        </el-form>
        <template #footer>
          <el-button @click="btnPreview =!btnPreview">{{btnPreview ?'预览':'编辑'}}</el-button>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary"  @click="handleSubmit" :loading="loading">{{isEdit?'更新':'新增创建'}}</el-button>
        </template>
    </el-dialog>
</template> 
<script setup>
import { ref,reactive,computed ,watch,nextTick} from 'vue'
import { uploadFile,createArticle ,updateArticle} from '@/api/admin'
import { ElMessage } from 'element-plus'
import { fileBaseUrl } from '@/config/index.js'
import RichTextEditor from '@/components/RichTextEditor.vue'


const props=defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    default:null
  }
})

const emit=defineEmits(['update:modelValue','success'])

const dialogVisible=computed({
  get(){
    return props.modelValue
  },
  set(val){
    emit('update:modelValue',val)
  }
})
 const isEdit=computed(()=>!!props.article?.id)

//监听编辑数据
watch(()=>props.article,(newVal)=>{
  if(newVal){
    nextTick(()=>{
      Object.assign(formData,newVal)
        //使用id
      businessId.value=newVal.id
        //封面
      imgUrl.value=fileBaseUrl+newVal.coverImage
    })
  
  }
})
const handleClose=()=>{
  //重置表单
  formRef.value.resetFields()
  //重置id
  businessId.value=null
  //重置标签
  formData.tagsArray=[]
  //重置封面图片和数据
  handleRemove()
  emit('update:modelValue',false)
}



const formData=reactive({
  "title":"",
  "content":"",
  "categoryId":"",
  "summary":"",
  "tagsArray":[],
  "id":""
})

const rules=reactive({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' },
    { max: 200, message: '标题长度不多于200 个字符', trigger: 'blur' }
  ],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
})

const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]

const imgUrl=ref('')
//上传
const beforeUpload=(file)=>{
    //校验文件
    console.log(file);
    const isImage=file.type.startsWith('image/')
    const isLt5M=file.size/1014/1014<5
    if(!isImage){
        ElMessage.error('请上传图片文件')
        return false
    }
    if(!isLt5M){
        ElMessage.error('图片大小不能超过5MB')
        return false
    }
    return true

}

const businessId=ref(null)

const handleUpLoadRequest=async ({file})=>{

    businessId.value=crypto.randomUUID()
    const fileRes= await uploadFile(file,{
        businessId:businessId.value

  })
  console.log(fileRes);

  //拼接图片地址
imgUrl.value=fileBaseUrl+fileRes.filePath
formData.coverImage=fileRes.filePath
}

const handleRemove=()=>{
    imgUrl.value=''
    formData.coverImage=''
}

//富文本
const handleContentChange=(val)=>{
    formData.content=val.html
}
const editorInstance=ref(null)

const handleEditorCreated=(editor)=>{
    editorInstance.value=editor
    //编辑
    if(formData.content && editor){
      nextTick(() => {
        editor.setHtml(formData.content)
      })    
} 
}
//预览
const btnPreview=()=>{
  if(editorInstance.value){
    const html=editorInstance.value.getHtml()
    formData.content=html
  }
}

//创建
const formRef=ref()
const loading=ref(false)

const handleSubmit= ()=>{
 formRef.value.validate((valid,fields)=>{

console.log(formData,'formData');
const submitData={
  ...formData,
  tags:formData.tagsArray.join(',')
}
  delete submitData.tagsArray

  if(!isEdit.value){
    submitData.id=businessId.value
     createArticle(submitData).then(res=>{
         loading.value=false
          emit('success')
     })
  }else{
    updateArticle(props.article.id,submitData).then(res=>{
         loading.value=false
          emit('success')
     })
   }
 })

}




</script>
<style lang="scss" scoped>
.cover-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color:#8b949e;
  background-color: #f6f8fa;
}
.cover-image{
  width: 200px;
  height: 120px;
  display: block;
}

</style>