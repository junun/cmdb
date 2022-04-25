import {message} from "antd";

import moment from 'moment';

// 为url 添加前缀
function urlComplement(uri){
  return 'http://127.0.0.1:8080/' + uri
}

// string 格式化
function timeStringTrans(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// 时间戳 格式化
function timeTrans(date){
    var date = new Date(date*1000);//如果date为13位不需要乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
}

// 时间戳 格式化 成年月日格式
function timeDatePicker(date){
    var date = new Date(date*1000);//如果date为13位不需要乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    return Y+M+D;
}

// DATETIME 格式化
function timeDatetimeTrans(date){
  var date = new Date(date);
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y+M+D+h+m+s;
}


// 比较今天是否是过期日(年)
function timeExpiredCheck(strDate, years) {
  let expiredDate = moment().subtract(years, 'year');
  // console.log(expiredDate);
  // console.log(strDate);
  // console.log(moment(expiredDate, 'yy:hh:mm').isBefore(moment(strDate, 'yy:hh:mm')))
  return moment(expiredDate, 'yy:hh:mm').isAfter(moment(strDate, 'yy:hh:mm'))

}


// js对象和数组深拷贝
function deepCopy(obj) {
    if (Array.isArray(obj)) {
        let result = [];
        for (let item of obj) {
            result.push(deepCopy(item))
        }
        return result
    } else if (typeof obj === 'object' && obj !== null) {
        let result = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = deepCopy(obj[key])
            }
        }
        return result
    } else {
        return obj
    }
}

// js 两个数组比较是否相等
function compareArray(a1, a2) {
    if ((!a1 && a2) || (a1 && ! a2)) return false;
    if (a1.length !== a2.length) return false;
    a1.sort().every(function(value, index) { 
       if (value !== a2.sort()[index]) return false
    });

    return true;
}

// 前端页面的权限判断(仅作为前端功能展示的控制，具体权限控制应在后端实现)
function hasPermission(strCode) {
  if (sessionStorage.getItem('is_supper')) return true;

  let permissions = sessionStorage.getItem('permissions');
  if (!strCode || !permissions) return false;
  permissions = permissions.split(',');

  for (let or_item of strCode.split('|')) {
    if (isSubArray(permissions, or_item.split('&'))) {
      return true
    }
  }
  return false
}

//  数组包含关系判断
export function isSubArray(parent, child) {
  for (let item of child) {
    if (!parent.includes(item.trim())) {
      return false
    }
  }
  return true
}

// 清理输入的命令中包含的\r符号
function cleanCommand(text) {
  return text ? text.replace(/\r\n/g, '\n') : ''
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

function basicQueryObj(payload) {
  let query;
  if (payload===undefined) {
    query = {
      page: 0,
      pageSize: 10,
    };
  } else {
    query = {
      page: payload.page && payload.page || 0,
      pageSize: payload.pageSize && payload.pageSize || 10,
    };
  }
  return query;
}

export { urlComplement, timeExpiredCheck, timeStringTrans, timeTrans, timeDatetimeTrans,
 timeDatePicker, deepCopy, compareArray, hasPermission,
 isEmpty, cleanCommand, basicQueryObj};
