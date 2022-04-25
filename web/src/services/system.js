import {httpGet, httpPut, httpPatch, httpPost, httpDel} from '@/utils/request';
import { stringify } from 'qs';


export async function getNotify(params) {
  return httpGet(`/api/v1/notify`);
}

export async function patchNotify(params) {
  return httpPatch(`/api/v1/notify`, params);
}

export async function userLogin(params) {
  return httpPost('/api/v1/user/login', params);
}

export async function userLogout() {
  return httpPost('/api/v1/user/logout');
}

export async function getSetting() {
  return httpGet('/api/v1/system');
}

export async function getSettingAbout() {
  return httpGet('/api/v1/system/about');
}

export async function getUser(params) {
  return httpGet(`/api/v1/user?${stringify(params)}`);
}

export async function userAdd(params) {
  return httpPost('/api/v1/user', params);
}
export async function userEdit(params) {
  return httpPut(`/api/v1/user/${params.id}`, params);
}

export async function userDel(params) {
  return httpDel(`/api/v1/user/${params}`);
}

export async function getUserPerm(params) {
  return httpGet(`/api/v1/user/${params}`);
}

export async function userPermAdd(params) {
  const  id = params.id;
  delete params.id
  return httpPost(`/api/v1/user/${id}/perm`, params);
}

export async function settingModify(params) {
  return httpPost(`/api/v1/system`, params);
}

export async function settingMailTest(params) {
  return httpPost(`/api/v1/system/mail`, params);
}

export async function settingLdapTest(params) {
  return httpPost(`/api/v1/system/ldap`, params);
}

export async function getRole() {
  return httpGet('/api/v1/role');
}

export async function roleAdd(params) {
  return httpPost('/api/v1/role', params);
}

export async function roleEdit(params) {
  return httpPut(`/api/v1/role/${params.id}`, params);
}

export async function roleDel(params) {
  return httpDel(`/api/v1/role/${params.id}`);
}

export async function getRolePerm(params) {
  return httpGet(`/api/v1/role/${params}`);
}

export async function getRoleMenu(params) {
  return httpGet(`/api/v1/perm/${params}`);
}

export async function getUserMenu(params) {
  return httpGet(`/api/v1/perm/${params}`);
}

export async function rolePermAdd(params) {
  const id = params.id;
  delete params.id
  return httpPost(`/api/v1/role/${id}/perm`, params);
}

// export async function getPermissions(params) {
//   return httpGet(`/api/v1/perm?${stringify(params)}`);
// }

export async function permAdd(params) {
  return httpPost('/api/v1/perm', params);
}

export async function permEdit(params) {
  return httpPut(`/api/v1/perm/${params.id}`, params);
}

export async function permDel(params) {
  return httpDel(`/api/v1/perm/${params}`);
}

// export async function getPerm(params) {
//   return httpGet(`/api/v1/perms?${stringify(params)}`);
// }

export async function getPerm(params) {
  return httpGet(`/api/v1/perm?${stringify(params)}`);
}

export async function getAllPerm() {
  return httpGet('/api/v1/perm/all');
}

export async function getMenu(params) {
  return httpGet(`/api/v1/menu?${stringify(params)}`);
}

export async function menuAdd(params) {
  return httpPost('/api/v1/menu', params);
}

export async function menuEdit(params) {
  return httpPut(`/api/v1/menu/${params.id}`, params);
}

export async function menuDel(params) {
  return httpDel(`/api/v1/menu/${params}`);
}

export async function getSubMenu(params) {
  return httpGet(`/api/v1/submenu?${stringify(params)}`);
}

export async function subMenuAdd(params) {
  return httpPost('/api/v1/submenu', params);
}

export async function subMenuEdit(params) {
  return httpPut(`/api/v1/submenu/${params.id}`, params);
}

export async function subMenuDel(params) {
  return httpDel(`/api/v1/submenu/${params}`);
}
