// 培养方案查询插件
// TODO: 1. 将弹出框的方向修改为自适应的上下左右4种，且大小在加载出来数据后也可以自适应
// TODO: 2. 美化表格样式
// TODO: 3. 将课程中时间和地点的对应关系体现的更清晰，分成两行
import { render as queryRender } from './queryTrainingScheme'
import { render as compareRender } from './compareTrainingScheme'
import { getPluginIcon } from '@/helper/getter'
import { SUAPlugin } from '@/core/types'

const style = require('./index.scss').toString()

export default {
  name: 'training-scheme',
  displayName: '培养方案相关',
  icon: getPluginIcon('training-scheme'),
  isNecessary: false,
  brief:
    '查询所有专业的培养方案与指导性教学计划，还可选择任意两个培养方案进行比较，甚至能将查询结果保存为长图。',
  route: [
    'advanced_query/query_training_scheme',
    'advanced_query/compare_training_scheme'
  ],
  menu: {
    rootMenuId: 'sua-menu-list',
    rootMenuName: 'SCU URP 助手',
    id: 'menu-advanced-query',
    name: '高级查询',
    item: [
      {
        name: '培养方案查询',
        style,
        route: 'advanced_query/query_training_scheme',
        breadcrumbs: ['SCU URP 助手', '高级查询', '培养方案查询'],
        render: queryRender
      },
      {
        name: '培养方案比较',
        style,
        route: 'advanced_query/compare_training_scheme',
        breadcrumbs: ['SCU URP 助手', '高级查询', '培养方案比较'],
        render: compareRender
      }
    ]
  }
} as SUAPlugin
