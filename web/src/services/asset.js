import {httpGet, httpPut, httpPost, httpDel} from '@/utils/request';
import { stringify } from 'qs';

export async function getDc(params) {
  return httpGet(`/api/v1/asset/dc?${stringify(params)}`);
}

export async function dcAdd(params) {
  return httpPost('/api/v1/asset/dc', params);
}
export async function dcEdit(params) {
  return httpPut(`/api/v1/asset/dc/${params.id}`, params);
}

export async function dcDel(params) {
  return httpDel(`/api/v1/asset/dc/${params}`);
}

export async function getRole(params) {
  return httpGet(`/api/v1/asset/role?${stringify(params)}`);
}

export async function roleAdd(params) {
  return httpPost('/api/v1/asset/role', params);
}
export async function roleEdit(params) {
  return httpPut(`/api/v1/asset/role/${params.id}`, params);
}

export async function roleDel(params) {
  return httpDel(`/api/v1/asset/role/${params}`);
}

export async function getRoleDetail(params) {
  return httpGet(`/api/v1/asset/detail?${stringify(params)}`);
}

export async function roleDetailAdd(params) {
  return httpPost('/api/v1/asset/detail', params);
}
export async function roleDetailEdit(params) {
  return httpPut(`/api/v1/asset/detail/${params.id}`, params);
}

export async function roleDetailDel(params) {
  return httpDel(`/api/v1/asset/detail/${params}`);
}

export async function getAsset(params) {
  return httpGet(`/api/v1/asset/asset?${stringify(params)}`);
}

export async function assetAdd(params) {
  return httpPost('/api/v1/asset/asset', params);
}
export async function assetEdit(params) {
  return httpPut(`/api/v1/asset/asset/${params.id}`, params);
}

export async function assetDel(params) {
  return httpDel(`/api/v1/asset/asset/${params}`);
}

