import { fetch } from 'dva';
// import history from './history'
import {notification, message} from 'antd';


// const codeMessage = {
//   200: '服务器成功返回请求的数据。',
//   201: '新建或修改数据成功。',
//   202: '一个请求已经进入后台排队（异步任务）。',
//   204: '删除数据成功。',
//   400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
//   401: '用户没有权限（令牌、用户名、密码错误）。',
//   403: '用户得到授权，但是访问是被禁止的。',
//   404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
//   406: '请求的格式不可得。',
//   410: '请求的资源被永久删除，且不会再得到的。',
//   422: '当创建一个对象时，发生一个验证错误。',
//   500: '服务器发生错误，请检查服务器。',
//   502: '网关错误。',
//   503: '服务不可用，服务器暂时过载或维护。',
//   504: '网关超时。',
// };


// 检查ajax返回的状态
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.name = response.status;
  error.response = response;
  throw error;
}

// fetch超时处理
// const TIMEOUT = 100000;
// const timeoutFetch = (url, options) => {
//   let fetchPromise = fetch(url, options);
//   let timeoutPromise = new Promise((resolve, reject) => {
//     setTimeout(() => reject(new Error('请求超时')), TIMEOUT);
//   });
//   return Promise.race([fetchPromise, timeoutPromise]);
// };

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options) {
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  // const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  // const hashcode = hash
  //   .sha256()
  //   .update(fingerprint)
  //   .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = {...defaultOptions, ...options};
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'PATCH' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Accept-Encoding': '',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        'Accept-Encoding': '',
        ...newOptions.headers,
      };
    }
  }

  const token = sessionStorage.getItem('jwt');
  if (token) {
    newOptions.headers = {
      Authorization: token,
      ...newOptions.headers,
    };
  }

  // return fetch(url, newOptions)
  return fetch(url, newOptions)
    .then(checkStatus)
    .then((response) => {
      return response.json();
    }).then((data) => {

      return data;

    }).catch((error) => {
      const { response } = error;

      let msg;
      let statusCode;
      if (response && response instanceof Object) {

        const { status, statusText } = response;
        statusCode = status;
        msg = statusText;
        if (statusCode === 401) {
          notification.error({
            message: 'token失效！',
            description: msg,
            key: 'error'
          })

          setTimeout(() => {
            return window.location.href="/user/login"
          }, 1000);

        }
        if (statusCode === 403) { // 没有权限
          notification.error({
            message: '没有权限！',
            description: msg,
            key: 'error'
          });
          return;
        }

        // if (statusCode >= 404 && statusCode < 422) {
        //   notification.error({
        //     message: '请求失败',
        //     description: msg,
        //     key: 'error'
        //   });
        //   return;
        // }
        // if (statusCode <= 504 && statusCode >= 500) {
        //   notification.error({
        //     message: '服务器错误',
        //     description: msg,
        //     key: 'error'
        //   });
        //   return;
        // }
      }

      // return message.error(msg);

      // return Promise.reject({
      //   success: false,
      //   code: statusCode,
      //   msg
      // });
      return response.json();
    }).then((data) => {
      return data;
    })
}

function httpGet(url) {
  return request(url, {method: 'GET'});
}

function httpPost(url, params) {
  return request(url, {method: 'POST', body: params})
}

function httpPut(url, params) {
  return request(url, {method: 'PUT', body: params})
}

function httpPatch(url, params) {
  return request(url, {method: 'PATCH', body: params})
}

function httpDel(url) {
  return request(url, {method: 'DELETE'})
}

export {request, httpGet, httpPost, httpPatch, httpPut, httpDel};
