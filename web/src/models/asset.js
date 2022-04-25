import {
  getDc, dcAdd, dcEdit, dcDel,
  getRole, roleAdd, roleEdit, roleDel,
  getRoleDetail, roleDetailAdd, roleDetailEdit, roleDetailDel,
  getAsset, assetAdd, assetEdit, assetDel,
} from '@/services/asset';
import { message } from 'antd';
import {basicQueryObj} from "@/utils/globalTools"

export default {
  namespace: 'asset',
  state: {
    page: 1,
    pageSize: 10,
    hostList: [],
    hostCount: 0,
    hostRoleList:[],
    hostAppList:[],
    configEnvList:[],
    envList: [],
    envCount: 0,
    dcList: [],
    dcCount: 0,
    roleList:[],
    roleCount:0,
    roleDetailList:[],
    roleDetailCount:0,
  },
  reducers: {
    updateDcList(state, { payload }) {
      return {
        ...state,
        dcList: payload.list,
        dcCount: payload.count,
      }
    },
    updateEnvList(state, { payload }) {
      return {
        ...state,
        envList: payload.list,
        envCount: payload.count,
      }
    },
    updateRoleList(state, { payload }) {
      return {
        ...state,
        roleList: payload.list,
        roleCount: payload.count,
      }
    },
    updateRoleDetailList(state, { payload }) {
      return {
        ...state,
        roleDetailList: payload.list,
        roleDetailCount: payload.count,
      }
    },
    updateHostList(state, { payload }) {
      return {
        ...state,
        hostList: payload.list,
        hostCount: payload.count,
      }
    },
    updateAssetList(state, { payload }) {
      return {
        ...state,
        assetList: payload.list,
        assetCount: payload.count,
      }
    },
    updateHostAppList(state, { payload }) {
      return {
        ...state,
        hostAppList: payload,
      }
    },
  },
  effects: {
    *getAsset({payload}, { call, put }) {
      let query;
      if (payload!==undefined) {
        query = {
          page: payload.page && payload.page || 0,
          pageSize: payload.pageSize && payload.pageSize || 10,
          status: payload.status && payload.status || "",
          sn: payload.sn && payload.sn || "",
          rid: payload.rid && payload.rid || ""
        }
      }

      const response = yield call(getAsset, query);
      yield put({
        type: 'updateAssetList',
        payload: response.data,
      });
    },
    *assetAdd({payload}, { call, put }){
      const response = yield call(assetAdd, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getAsset',
        });
      } else {
        message.error(response.msg);
      }
    },
    *assetEdit({payload}, { call, put}){
      const response = yield call(assetEdit, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getAsset',
        });
      } else {
        message.error(response.msg);
      }
    },
    *assetDel({payload}, { call, put }){
      const response = yield call(assetDel, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getAsset',
        });
      } else {
        message.error('删除错误， 请检查是否有依赖？');
      }
    },
    *getDc({payload}, { call, put }) {
      let query = basicQueryObj(payload);
      const response = yield call(getDc, query);
      yield put({
        type: 'updateDcList',
        payload: response.data,
      });
    },
    *dcAdd({payload}, { call, put }){
      const response = yield call(dcAdd, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getDc',
        });
      } else {
        message.error(response.msg);
      }
    },
    *dcEdit({payload}, { call, put}){
      const response = yield call(dcEdit, payload);
      if (response && response.code === 200) {
        message.success(response.message);
        yield put({
          type: 'getDc',
        });
      } else {
        message.error(response.msg);
      }
    },
    *dcDel({payload}, { call, put }){
      const response = yield call(dcDel, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getDc',
        });
      } else {
        message.error('删除错误， 请检查是否有依赖？');
      }
    },
    *getRole({payload}, { call, put }) {
      let query = basicQueryObj(payload);
      const response = yield call(getRole, query);
      yield put({
        type: 'updateRoleList',
        payload: response.data,
      });
    },
    *roleAdd({payload}, { call, put }){
      const response = yield call(roleAdd, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRole',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleEdit({payload}, { call, put}){
      const response = yield call(roleEdit, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRole',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleDel({payload}, { call, put }){
      const response = yield call(roleDel, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRole',
        });
      } else {
        message.error('删除错误， 请检查是否有依赖？');
      }
    },
    *getRoleDetail({payload}, { call, put }) {
      let query = basicQueryObj(payload);
      const response = yield call(getRoleDetail, query);
      yield put({
        type: 'updateRoleDetailList',
        payload: response.data,
      });
    },
    *roleDetailAdd({payload}, { call, put }){
      const response = yield call(roleDetailAdd, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRoleDetail',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleDetailEdit({payload}, { call, put}){
      const response = yield call(roleDetailEdit, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRoleDetail',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleDetailDel({payload}, { call, put }){
      const response = yield call(roleDetailDel, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getRoleDetail',
        });
      } else {
        message.error('删除错误， 请检查是否有依赖？');
      }
    },
  }
};
