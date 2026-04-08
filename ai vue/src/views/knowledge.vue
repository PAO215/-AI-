<template>
  <div >
   <PageHead title="知识文章">
    <template #buttons>
        <el-button @click="handleEdit({})" type="primary">新增</el-button>
       
    </template>
   </PageHead>
  <TableSearch :formItem="formItem" @search="handleSearch" />
  <el-table :data="tableData" style="width:100%;margin-top:25px">
    <el-table-column  width="200" label="文章标题" fixed="left" >
    <template #default="scope">
        <div style="display:flex;align-items:center;">
          <el-icon><Timer /></el-icon>
          <span>{{ scope.row.title }}</span>
        </div>
    </template>
  </el-table-column>
  <el-table-column  label="分类" width="200" >
    <template #default="scope">
        <div style="display:flex;align-items:center;">
           <el-icon><Timer /></el-icon>
           <span>{{ categoryMap[scope.row.categoryId] || '未分类' }}</span>
            
        </div>
    </template>
  </el-table-column>
  <el-table-column prop="authorName" label="作者" width="150" />
  <el-table-column prop="readCount" label="阅读量" width="150" />
  <el-table-column prop="publishedAt" label="发布时间" width="150" />
  <el-table-column  label="操作"  width="240"  fixed="right" >
    <template #default="scope">
      <el-button @click="handleEdit(scope.row)" text type="primary" >编辑</el-button>
      <el-button @click="handlePublish(scope.row)" v-if="scope.row.status===0||scope.row.status===2" text type="success" >发布</el-button>
      <el-button @click="handleUnpublish(scope.row)" v-if="scope.row.status===1" text type="warning" >下线</el-button>
      <el-button @click="handleDelete(scope.row)"  text type="danger" >删除</el-button>
    </template>
  </el-table-column>
  </el-table>
  <el-pagination
  style="margin-top:25px"
  :page-size="pagination.size"
  layout="prev,pager,next"
  :total="pagination.total" 
  @change="handleChange"/>
  <ArticleDialog v-model:modelValue="dialogVisible" :article="currentArticle" :categories="categories" @success="handleSuccess"/>
  </div>
</template>

<script setup>
// 1. 导入依赖
import { Timer } from '@element-plus/icons-vue' // 导入 timer 图标
import { ref,reactive,onMounted } from 'vue'
import TableSearch from '@/components/TableSearch.vue'
import PageHead from '@/components/PageHead.vue'
import { categoryTree ,articlePage,getArticleDetail,changeArticleStatus,deleteArticle} from '@/api/admin'
import ArticleDialog from '@/components/ArticleDialog.vue'
import {ElMessageBox,ElMessage} from 'element-plus'


// 2. 表单配置（响应式）
const formItem=ref([  //改成响应式ref
  { comp: 'input',prop:'title',label:'文章标题',placeholder:'请输入文章标题' },
  { comp: 'select',prop:'categoryId',label:'分类',placeholder:'请选择分类'},
  { comp: 'select',prop:'status',label:'状态',placeholder:'请选择状态',options:[
    {label:'已下线',value:2},
    {label:'已发布',value:1},
    {label:'草稿',value:0}
  ]}
])


//分页参数
const pagination=reactive({
  currentPage:1,
  size:10,
  total:0
})

const handleSearch= async (formData)=>{
 console.log(formData,'查询数据');

 const params={
  ...formData,
  ...pagination
 }


const { records, total } = await articlePage(params)
 tableData.value=records
 pagination.total=total
}

const handleChange=(page)=>{
  pagination.currentPage=page
  handleSearch()
}


//分类映射
const categoryMap=reactive({})
//分类列表
const categories=ref([])
//列表数据
const tableData=ref([])

 // 文章详情弹窗
const dialogVisible = ref(false)

//  文章详情弹窗成功回调
const handleSuccess=()=>{
    dialogVisible.value=false
  //刷新列表
  handleSearch()
}

const currentArticle=ref(null)
//编辑
const handleEdit=(row)=>{ 
     if(!row.id) {
      //新增
      currentArticle.value=null
      dialogVisible.value=true


     }else{
      //编辑
          getArticleDetail(row.id).then(res=>{
          console.log(res,'编辑详细');
           currentArticle.value=res
          dialogVisible.value=true
         })
     }
     
}

//发布
const handlePublish=(row)=>{
  ElMessageBox.confirm(
  `确认发布文章${row.title}吗？`, 
  '确认',
   {
    confirmButtonText:'确定',
    cancelButtonText:'取消',
    type:'info'

    }).then(()=>{
      changeArticleStatus(row.id,{status:1}).then(res=>{
        ElMessage.success('文章发布成功');
        handleSearch()
      })
    })

     }

     //下线文章
     const handleUnpublish=(row)=>{
      ElMessageBox.confirm(
      `确认下线文章${row.title}吗？`, 
      '确认',
       {
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'warning'

        }).then(()=>{
        changeArticleStatus(row.id,{status:2}).then(res=>{
          ElMessage.success('文章下线成功');
          handleSearch()
        })
      })
    }

    //删除文章
    const handleDelete=(row)=>{
      ElMessageBox.confirm(
      `确认删除文章${row.title}吗？`, 
      '确认',
       {
        confirmButtonText:'确定',
        cancelButtonText:'取消',
        type:'danger'

        }).then(()=>{
        deleteArticle(row.id).then(res=>{
          ElMessage.success('文章删除成功');
          handleSearch()
        })
      })
    }


/*原代码
onMounted(async()=>{
    const datas = await categoryTree()

    categories.value=datas.map(item => {
      categoryMap[item.id]=item.categoryName
      return{
        label:item.categoryName,
        value:item.id
      }
    })
    formItem[1].options=categories.value
})

*/

// 6. 页面挂载后初始化
onMounted(async () => {
  try {
    // 第一步：加载分类数据（拦截器已返回分类数组）
    const categoryList = await categoryTree()
    console.log('接口返回的分类数组：', categoryList); // 能看到4个分类对象

    // 兜底：确保是数组（防止接口返回非数组）
    const safeArr = Array.isArray(categoryList) ? categoryList : []
    
    // 第二步：格式化分类数据 + 给categoryMap赋值（关键！）
    categories.value = safeArr.map(item => {
      // 核心：把分类ID和名称映射起来
      categoryMap[item.id] = item.categoryName
      console.log('映射关系：', item.id, '→', item.categoryName); // 验证映射
      return {
        label: item.categoryName,
        value: item.id
      }
    })

    // 给下拉框赋值
   /* formItem[1].options = categories.value
  } catch (err) {
    console.error('加载分类失败：', err)
    formItem[1].options = [] // 异常时给空数组
  }*/

  // 第三步：给分类下拉框赋值
    formItem.value[1].options = [
      ...categories.value           // 接口返回的分类
    ]
    console.log('分类下拉框选项：', formItem.value[1].options);
 // 第四步：调用搜索（只调一次！传空对象）
    await handleSearch({})
  } catch (err) {
    console.error('加载分类失败：', err)
    // 失败时只显示“全部”
    formItem.value[1].options = [{ label: '全部', value: '' }]
  }
})
/*
//修正后 ，data.data.data 才是数组
onMounted(async() => {
  const datas = await categoryTree()
  console.log('接口返回完整数据：', datas)
  
  // 正确取值：datas.data.data 才是数组
  const arr = datas.data?.data || [] // 可选链 + 兜底空数组
  
  categories.value = arr.map(item => {
    categoryMap[item.id] = item.categoryName
    return {
      label: item.categoryName,
      value: item.id
    }
  })
  formItem[1].options = categories.value
})*/


</script>