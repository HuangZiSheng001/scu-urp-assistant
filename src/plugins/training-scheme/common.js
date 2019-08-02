const fs = require('fs')
export const trainingSchemeList = JSON.parse(fs.readFileSync('src/data/training-scheme-list.json', 'utf8'))

export function getSelfMajorNumber () {
  const $ = window.$
  $.ajaxSetup({
    beforeSend: xhr => xhr.setRequestHeader('X-Requested-With', {
      toString () {
        return ''
      }
    })
  })
  const res = $.get('/student/rollManagement/rollInfo/index').then(res => res.match(/name="zx" value="(\d+)"/)[1])
  // 还原Ajax配置
  $.ajaxSetup({
    beforeSend: null
  })
  return res
}

export function getTrainingSchemeData (number) {
  const $ = window.$
  $.ajaxSetup({
    beforeSend: xhr => xhr.setRequestHeader('X-Requested-With', {
      toString () {
        return ''
      }
    })
  })
  const coursePropertyNameList = ['必修', '选修']
  const res = Promise.all([
    $.get(`/student/rollManagement/project/${number}/2/detail`)
      .then(({ jhFajhb, treeList }) =>
        ({
          info: jhFajhb,
          list: treeList
            .reduce(
              (acc, cur) => {
                if (cur.name.match(/^\d{4}-\d{4}学年$/)) {
                  acc.push({
                    name: cur.name,
                    children: []
                  })
                } else if (cur.name === '春' || cur.name === '秋') {
                  acc[acc.length - 1]
                    .children.push({
                      name: cur.name,
                      children: []
                    })
                } else {
                  acc[acc.length - 1]
                    .children[acc[acc.length - 1].children.length - 1]
                    .children.push({
                      courseName: cur.name,
                      courseNumber: cur.urlPath.match(/project\/.+\/(\d+)$/)[1]
                    })
                }
                return acc
              },
              [])
            .sort((a, b) => {
              const regexpResultA = a.name.match(/^(\d+)-(\d+)学年$/)
              const regexpResultB = b.name.match(/^(\d+)-(\d+)学年$/)
              const resultA = Number(regexpResultA[1]) + Number(regexpResultA[2])
              const resultB = Number(regexpResultB[1]) + Number(regexpResultB[2])
              return resultA - resultB
            })
        })),
    $.get(`/student/rollManagement/project/${number}/1/detail`)
      .then(({ treeList }) =>
        Object.values(treeList.reduce((acc, cur) => {
          acc[cur.id] = cur
          if (!acc[cur.pId]) {
            acc[cur.pId] = { id: cur.pId }
          }
          cur.parent = acc[cur.pId]
          cur.isDir = cur.name.includes('fa-kz')
          if (cur.name.includes('必修')) {
            cur.coursePropertyName = '必修'
          } else if (cur.name.includes('选修')) {
            cur.coursePropertyName = '选修'
          } else {
            cur.coursePropertyName = ''
          }
          cur.courseName = cur.name.match(/<\/i>(.+)$/)[1].replace(' 必修', '').replace(' 选修', '')
          return acc
        }, {})).reduce((acc, { urlPath, isDir, parent, courseName, coursePropertyName }) => {
          if (urlPath) {
            const courseNumber = urlPath.match(/@(.+)$/)[1]
            if (!isDir) {
              const courseAttributes = []
              let p = parent
              while (p.courseName) {
                if (!coursePropertyNameList.includes(p.courseName)) {
                  courseAttributes.unshift(p.courseName)
                }
                p = p.parent
              }
              acc[courseNumber] = {
                courseName, courseNumber, coursePropertyName, courseAttributes
              }
            }
          }
          return acc
        }, {})
      )
  ])
    .then(([{ info, list }, table]) =>
      ({
        info,
        list: list.map(year =>
          ({
            name: year.name,
            children: year.children.map(semester =>
              ({
                name: semester.name,
                children: semester.children
                  .map(v =>
                    Object.assign(
                      v,
                      table[v.courseNumber],
                      { courseMajor: `${info.zym}（${info.njmc}）` }
                    ))
                  .sort((a, b) => {
                    const propertyWeight = {
                      必修: 100,
                      '中华文化（春）': 75,
                      '中华文化（秋）': 75,
                      选修: 50
                    }
                    const attributeWeight = {
                      公共基础课: 10,
                      公共课: 10,
                      '中华文化（春）_kz': 9,
                      '中华文化（秋）_kz': 9,
                      学科基础课: 8,
                      专业基础课: 8,
                      专业课: 6,
                      实践环节: 4
                    }
                    const getAttributesWeight = (attributes) => (attributes || []).reduce((acc, cur) => acc + (attributeWeight[cur] || 0), 0)
                    const weightA = (propertyWeight[a.coursePropertyName] || 0) + getAttributesWeight(a.courseAttributes)
                    const weightB = (propertyWeight[b.coursePropertyName] || 0) + getAttributesWeight(b.courseAttributes)
                    return weightB - weightA
                  })
              }))
          }))
      })
    )
  // 还原Ajax配置
  $.ajaxSetup({
    beforeSend: null
  })
  return res
}

export function showLoadingAnimation (containerSelector) {
  const $ = window.$
  const template = `
      <div class="loading-container">
        <div class="lds-dual-ring"></div>
        <div class="lds-title">( º﹃º ) 兆基祈祷中……</div>
      </div>
    `
  $('.info-container').remove()
  $('.scheme-container').remove()
  $(containerSelector).append(template)
}

export function hideLoadingAnimation () {
  const $ = window.$
  $('.loading-container').remove()
}
