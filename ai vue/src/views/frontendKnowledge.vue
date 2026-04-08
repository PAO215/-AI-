<template>
    <div class="knowledge-container">
        <div class="header-section">
            <div class="header-content">
                <el-image :src="iconUrl" style="width: 100px; height: 100px;" />
                <h1>知识库</h1>
            </div>
        </div>
        <div class="content">
            <!-- 左侧菜单 -->
             <div class="recommend-section">
                <div class="section-title">推荐阅读</div>
                <div class="recommend-list">
                    <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="goToArticle(item.id)">
                           <h4>{{item.title}}</h4>
                           <p class="read-count">
                            <el-icon><Histogram /></el-icon>
                                阅读量 {{item.readCount }}
                           </p>
                        
                    </div>
                </div>
             </div>
             <!-- 右侧内容 -->
             <div class="article-list">
                <div v-for="item in articleList" :key="item.id" class="article-item" @click="goToArticle(item.id)">
                    <el-image :src="getImage(item.coverImage)" style="width: 240px; height: 150px;" />
                    <div class="info">
                        <div class="title">
                            <h3>{{item.title}}</h3>
                            <el-tag Plain type="primary"> {{item.categoryName}}</el-tag>
                        </div>
                        <div :style="{marginTop: '10px'}">
                            <div class="flex-box">
                                <el-icon><Avatar /></el-icon>
                                <span>{{item.authorName}}</span>
                            </div>
                            <div class="flex-box">
                                <el-icon><List /></el-icon>
                                <span>{{dayjs(item.updateAt).format('YYYY-MM-DD')}}</span>
                            </div>
                            <div class="flex-box">
                                <el-icon><Platform /></el-icon>
                                <span>观看人数{{item.readCount}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
         <!-- 分页 -->
             <div class="pagination-wrapper">
               <el-pagination
                    style="margin-top: 25px;"
                    :page-size="pagination.size"
                    :total="pagination.total"
                    layout="prev, pager, next"
                    @change="handleChange"
                />
             </div>
    </div>

</template>
<script setup>
    import { ref,reactive,onMounted } from 'vue'    
    import {getKnowledgeList} from '@/api/frontend'
    import dayjs from 'dayjs'
    import {useRouter} from 'vue-router'
    const router = useRouter()
    
    import { Platform } from '@element-plus/icons-vue'
    import iconUrl from '@/assets/images/book.png'

    //推荐阅读列表
    const recommendList = ref([])
    //右侧列表数据
    const pagination = reactive({
        currentPage: 1,
        size: 10,
        total: 0
    })
    const articleList = ref([])
    //获取列表数据
    const getPageList = () => {
        const params = {
            sortField: 'publishedAt',
            sortDirection: 'desc',//传入顺序，倒叙
            ...pagination
        }
        getKnowledgeList(params).then(res => {
           articleList.value = res.records
           pagination.total = res.total
        })
    }
    //获取封面图片
    const getImage = (url) => {
        return url ? 'http://159.75.169:1235' + url :'https://file.itndedu.com/psychology_ai.png'
    }
    //分页
    const handleChange=(page)=>{
    pagination.currentPage=page
    getPageList()
    }
    //跳转文章详情
    const goToArticle=(id)=>{
        router.push({
            path: `/knowledge/article/${id}`,
        })
    }
    onMounted(() => {
        /// 获取推荐阅读列表
        const params = {
            sortField: 'createTime',
            sortDirection: 'desc',
            currentPage: 1,
            size: 5
        }
        getPageList()
        getKnowledgeList(params).then(res => {
            recommendList.value = res.records
        })
    })



</script>

<style lang="scss" scoped>
.knowledge-container {
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
    .flex-box {
        display: flex;
        align-items: center;
        span {
            margin-left: 10px;
        }
    }
    .header-section {
        background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
        color: white;
        padding: 48px;
        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    .content {
        display: flex;
        gap: 20px;
        margin: 0 auto;
        width: 1200px;
        padding: 20px;
        .recommend-section {
            width: 280px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            padding: 15px;
            height: 400px;
            .section-title {
                font-size: 12;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .recommend-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                .recommend-item {
                    border-left: 4px solid #f59e0b;
                    padding-left: 10px;
                    cursor: pointer;
                    .read-count {
                        margin-top: 15px;
                        font-size: 12px;
                        color: #6b7280;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
        .article-list {
            flex: 1;
            .article-item {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                padding: 15px;
                margin-bottom: 20px;
                display: flex;
                .info {
                    margin-left: 20px;
                    .title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
    }
    .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding-bottom: 30px;
    }
}
.articleDetail-container {
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
    .flex-box {
        display: flex;
        align-items: center;
        .item {
            margin-right: 20px;
            span {
                margin-left: 5px;
            }
        }
    }
    .header-section {
        background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
        color: white;
        padding: 48px;
        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    .content {
        margin: 0 auto;
        width: 980px;
        padding: 20px;
        .diary-card {
            margin-bottom: 20px;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            .title {
                margin-bottom: 15px;
                font-size: 20px;
                font-weight: 600;
                color: #374151;
            }
            .sub-title {
                margin-top: 20px;
                display: flex;
                align-items: center;
                .category-tag {
                    margin-right: 20px;
                }
            }
            .article-title {
                font-size: 28px;
                font-weight: bold;
                color: #111827;
                margin-top: 30px;
                margin-bottom: 10px;
            }
            .summary-content {
                background: rgba(126, 211, 33, 0.1);
                border-left: 4px solid #7ED321;
                padding: 10px 15px;
                border-radius: 0 8px 8px 0;
                position: relative;
            }
            .content-wrapper {
                font-size: 15px;
                color: #374151;
                :deep(p) {
                    margin-bottom: 10px;
                }
                :deep(h1),
                :deep(h2),
                :deep(h3),
                :deep(h4),
                :deep(h5),
                :deep(h6) {
                    margin: 15px 0 10px;
                    color: #111827;
                    font-weight: 600;
                }
                :deep(h2) {
                    font-size: 15px;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 5px;
                }
                :deep(h3) {
                    font-size: 13px;
                }
                :deep(ul),
                :deep(ol) {
                    padding-left: 15px;
                    margin-bottom: 10px;
                }
                :deep(li) {
                    margin-bottom: 5px;
                }
            }
            .tags-content {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
                .tags-title {
                    margin-bottom: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }
                .tags-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
            }
        }
    }
}



</style>