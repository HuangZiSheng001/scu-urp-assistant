import {
  trainingSchemeList,
  getSelfMajorNumber,
  getTrainingSchemeData,
  showLoadingAnimation,
  hideLoadingAnimation
} from './common'
import {
  JhFajhb,
  TrainingSchemeYearItem,
  TrainingSchemeSemesterItem,
  TrainingSchemeCourse
} from './types'
import { initCourseInfoPopover } from './popover'
import { getChineseNumber } from '../../utils/basic'

async function query() {
  const number = $('#major').val()
  if (number !== '无') {
    showLoadingAnimation('.training-scheme-wrapper')
    const { info, list } = await getTrainingSchemeData(number as string)
    hideLoadingAnimation()
    $('.training-scheme-wrapper').append(genInfoHTML(info))
    $('.training-scheme-wrapper').append(genSchemeHTML(list))
    initCourseInfoPopover()
  }
}

function updateMajorList() {
  const grade = $('#grade').val()
  const department = $('#department').val()
  const res = trainingSchemeList
    .filter(v => v[1] === grade && v[2] === department)
    .map(v => `<option value="${v[0]}">${v[3]}</option>`)
    .join('')
  $('#major')
    .empty()
    .append(res || `<option value="无">无</option>`)
}

export function render(root: HTMLElement) {
  initFunc()
  initDOM(root)
  selectSelfMajorAndQuery()
}

function initFunc() {
  window.__$SUA_TRAINING_SCHEME_UPDATE_MAJOR_LIST__ = updateMajorList
  window.__$SUA_TRAINING_SCHEME_QUERY__ = query
}

function initDOM(root: HTMLElement) {
  const template = `
      <div class="training-scheme-wrapper">
        ${genQueryHTML()}
      </div>
    `
  $(root).append(template)
}

async function selectSelfMajorAndQuery() {
  const selfMajorNumber = await getSelfMajorNumber()
  const selfSchemeInfo = trainingSchemeList.filter(
    v => v[0] === selfMajorNumber
  )[0]
  $('#grade').val(selfSchemeInfo[1] as string)
  $('#department').val(selfSchemeInfo[2] as string)
  updateMajorList()
  $('#major').val(selfSchemeInfo[0] as string)
  query()
}

function genQueryHTML() {
  const { gradeList, departmentList } = trainingSchemeList.reduce(
    (acc, cur) => ({
      gradeList: acc.gradeList.includes(cur[1] as string)
        ? acc.gradeList
        : acc.gradeList.concat(cur[1] as string),
      departmentList: acc.departmentList.includes(cur[2] as string)
        ? acc.departmentList
        : acc.departmentList.concat(cur[2] as string)
    }),
    { gradeList: [] as string[], departmentList: [] as string[] }
  )
  return `
      <div class="query-container">
        <div class="row">
          <div class="col-xs-12 self-margin">
            <h4 class="header smaller lighter grey">
              <i class="ace-icon fa fa-search"></i>查询条件
              <span class="right_top_oper">
                <button id="queryButton" title="查询" class="btn btn-info btn-xs btn-round" onclick="__$SUA_TRAINING_SCHEME_QUERY__()">
                  <i class="ace-con fa fa-search white bigger-120"></i>查询
                </button>
              </span>
            </h4>
            <div class="profile-user-info profile-user-info-striped self">
              <div class="profile-info-row">
                <div class="profile-info-name">年级</div>
                <div class="profile-info-value">
                  <select name="grade" id="grade" class="select form-control value_element" onchange="__$SUA_TRAINING_SCHEME_UPDATE_MAJOR_LIST__()">
                    <option value="请选择年级">请选择年级</option>
                    ${gradeList
                      .sort(
                        (a, b) =>
                          Number(b.replace('级', '')) -
                          Number(a.replace('级', ''))
                      )
                      .map(v => `<option value="${v}">${v}</option>`)
                      .join('')}
                  </select>
                </div>
                <div class="profile-info-name">院系</div>
                <div class="profile-info-value">
                  <select name="department" id="department" class="select form-control value_element" onchange="__$SUA_TRAINING_SCHEME_UPDATE_MAJOR_LIST__()">
                    <option value="请选择学院">请选择学院</option>
                    ${departmentList
                      .map(v => `<option value="${v}">${v}</option>`)
                      .join('')}
                  </select>
                </div>
                <div class="profile-info-name">专业</div>
                <div class="profile-info-value">
                  <select name="major" id="major" class="form-control value_element">
                    <option value="无">无</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
}

function genInfoHTML(info: JhFajhb) {
  for (const key of Object.keys(info)) {
    if (!info[key]) {
      info[key] = '-'
    }
  }
  return `
      <div class="info-container">
        <div class="info-header row">
          <div class="col-xs-12">
            <h4 class="header smaller lighter grey">
              <i class="fa fa-graduation-cap"></i> ${info.zym}方案计划信息
            </h4>
          </div>
        </div>
        <div class="info-content row">
          <div class="col-xs-12 col-md-4">
            <table class="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>方案名称</td>
                  <td>${info.famc}</td>
                </tr>
                <tr>
                  <td>计划名称</td>
                  <td>${info.jhmc}</td>
                </tr>
                <tr>
                  <td>年级</td>
                  <td>${info.njmc}</td>
                </tr>
                <tr>
                  <td>院系名称</td>
                  <td>${info.xsm}</td>
                </tr>
                <tr>
                  <td>专业名称</td>
                  <td>${info.zym}</td>
                </tr>
                <tr>
                  <td>专业方向名称</td>
                  <td>${info.zyfxm}</td>
                </tr>
                <tr>
                  <td>学位</td>
                  <td>${info.xwm}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-xs-12 col-md-4">
            <table class="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>毕业类型</td>
                  <td>${info.bylxmc}</td>
                </tr>
                <tr>
                  <td>学制类型</td>
                  <td>${info.xzlxmc}</td>
                </tr>
                <tr>
                  <td>修读类型</td>
                  <td>${info.xdlxmc}</td>
                </tr>
                <tr>
                  <td>方案计划类型</td>
                  <td>${info.fajhlx}</td>
                </tr>
                <tr>
                  <td>开始学年</td>
                  <td>${info.xnmc}</td>
                </tr>
                <tr>
                  <td>学期类型</td>
                  <td>${info.xqlxm}</td>
                </tr>
                <tr>
                  <td>开始学期</td>
                  <td>${info.xqm}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-xs-12 col-md-4">
            <table class="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>要求总学分</td>
                  <td>${info.yqzxf}</td>
                </tr>
                <tr>
                  <td>课程总学分</td>
                  <td>${info.kczxf}</td>
                </tr>
                <tr>
                  <td>课程总门数</td>
                  <td>${info.kczms}</td>
                </tr>
                <tr>
                  <td>课程总学时</td>
                  <td>${info.kczxs}</td>
                </tr>
                <tr>
                  <td>学制类型</td>
                  <td>${info.xzlxmc}</td>
                </tr>
                <tr>
                  <td>培养目标</td>
                  <td>${info.pymb}</td>
                </tr>
                <tr>
                  <td>修读要求</td>
                  <td>${info.xdyq}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-xs-12">
            <table class="table table-bordered table-hover">
              <tbody>
                <tr>
                  <td>备注</td>
                  <td>${info.bz}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
}

function genSchemeHTML(list: TrainingSchemeYearItem[]) {
  const courseItemTemplate = (course: TrainingSchemeCourse, number: number) => `
      <div class="course-item-wrapper">
        <div class="course-item" data-course-number="${
          course.courseNumber
        }" data-course-name="${course.courseName}">
          <div class="course-item-info">
            <div class="info-primary">
              <div class="course-name">
                <div>${number}. <span>${course.courseName}</span></div>
              </div>
            </div>
            <div class="info-secondary">
              <div class="info-tag course-number">课程号：${
                course.courseNumber
              }</div>
              ${
                course.coursePropertyName
                  ? `<div class="info-tag course-property-name${
                      course.coursePropertyName === '必修' ||
                      course.coursePropertyName.includes('中华文化')
                        ? ' required'
                        : ''
                    }">${course.coursePropertyName}</div>`
                  : ''
              }
              ${course.courseAttributes
                .map(v => `<div class="info-tag course-attribute">${v}</div>`)
                .join('&nbsp;')}
            </div>
          </div>
        </div>
      </div>
    `
  const semesterItemTemplate = (semester: TrainingSchemeSemesterItem) => `
      <div class="semester-item">
        <div class="semester-item-title">${semester.name}</div>
        <div class="semester-item-content">
          ${semester.children
            .map((v, i) => courseItemTemplate(v, i + 1))
            .join('')}
        </div>
      </div>
    `

  const yearItemTemplate = (year: TrainingSchemeYearItem, grade: number) => `
    <div class="year-item">
      <div class="year-item-title"><i class="fa fa-cubes" aria-hidden="true"></i> ${
        year.name
      }（${getChineseNumber(grade)}年级）</div>
      <div class="year-item-content">
        ${year.children
          .map(v => semesterItemTemplate(v))
          .join('<div class="semester-divider"></div>')}
      </div>
    </div>
    `

  return `
      <div class="scheme-container">
        <div class="row">
          <div class="col-xs-12">
            <h4 class="header smaller lighter grey">
              <i class="fa fa-book"></i> 培养方案与指导性教学计划
            </h4>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-12">
            <div class="scheme-wrapper">
              ${list.map((v, i) => yearItemTemplate(v, i + 1)).join('')}
            </div>
          </div>
        </div>
      </div>
    `
}