import { userLogin, userLogout, getNotify, patchNotify, getUserMenu, getUserPerm,
  getRole,roleAdd, roleEdit, roleDel, getRolePerm, getRoleMenu, userPermAdd, rolePermAdd,
  getUser,userAdd, userEdit, userDel, settingLdapTest,
  getPerm, permAdd, permEdit, getAllPerm, permDel,
  getMenu, menuAdd, menuEdit, menuDel,
  getSubMenu, subMenuAdd, subMenuEdit,subMenuDel,
  getSetting, getSettingAbout, settingModify, settingMailTest,
  } from '@/services/system';
import router from 'umi/router';
import { message } from 'antd';

export default {
  namespace: 'system',

  state: {
    page: 1,
    pageSize: 10,
    menu: [],
    user: {},
    notifies: [],
    menuList: [],
    menuCount: 0,
    subMenuList: [],
    subMenuCount:0,
    //用户列表
    userList: [],
    userCount: 0,
    roleList: [],
    roleCount: 0,
    permList : [],
    permCount: 0,
    allPermList : [],
    userPermList:[],
    rolePermList : [],
    roleVisible: false,
    settingList: [],
    settingAbout: {},
    allEnvAppList: [],
    envAppList: {},
    robotList: [],
    robotCount: 0,
  },

  reducers: {
    updateMenu(state, { payload }) {
      return {
        ...state,
        menu: payload,
      };
    },
    updateNotify(state, { payload: notifies }) {
      return {
        ...state,
        notifies,
      };
    },
    updateUser(state, { payload }) {
      return {
        ...state,
        userList: payload.list,
        userCount: payload.count,
      }
    },
    updateRoleList(state, { payload }) {
      return {
        ...state,
        roleList: payload.list,
        roleCount: payload.count,
      }
    },
    updatePermList(state, { payload }){
      return {
        ...state,
        permList: payload.list,
        permCount: payload.count,
      }
    },
    updateAllPermList(state, { payload }){
      return {
        ...state,
        allPermList: payload,
      }
    },
    updateAllEnvAppList(state, { payload }){
      return {
        ...state,
        allEnvAppList: payload,
      }
    },
    updateAllEnvHostList(state, { payload }){
      return {
        ...state,
        allEnvHostList: payload,
      }
    },
    updateRoleEnvAppList(state, { payload }){
      return {
        ...state,
        envAppList: payload,
      }
    },
    updateUserPermList(state, { payload }){
      return {
        ...state,
        userPermList: payload,
      }
    },
    updateRolePermList(state, { payload }){
      return {
        ...state,
        rolePermList: payload,
      }
    },
    cancelRolePerm(state) {
      return {
        ...state,
        roleVisible: false,
        rolePermList: [],
      }
    },
    updateMenuList(state, { payload }){
      return {
        ...state,
        menuList: payload,
      }
    },
    updateSubMenuList(state, { payload }){
      return {
        ...state,
        subMenuList: payload.list,
        subMenuCount: payload.count,
      }
    },
    updatePage(state, { payload }) {
      return {
        ...state,
        page: payload.page,
        pageSize: payload.pageSize && payload.pageSize || 10
      }
    },
    updateSettingList(state, { payload }) {
      return {
        ...state,
        settingList: payload.list,
      }
    },
    updateSettingAbout(state, { payload }) {
      return {
        ...state,
        settingAbout: payload.list,
      }
    },
    updateRobotList(state, { payload }) {
      return {
        ...state,
        robotList: payload.list,
        robotCount: payload.count,
      }
    },
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(userLogin, payload);
      console.log("login",response);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });

      if (response && response.code === 200) {
        const token = response.data.token;
        sessionStorage.setItem('jwt', token);
        sessionStorage.setItem('is_supper', response.data.is_supper);
        sessionStorage.setItem('permissions', response.data.permissions);
        sessionStorage.setItem('user', JSON.stringify(response.data));
        yield put(router.push('/welcome'));
      } else {
        message.error(response.msg);
      }
    },
    *logout(payload, { call, put }) {
      const response = yield call(userLogout);
      if (response && response.code === 200) {
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('is_supper');
        sessionStorage.removeItem('permissions');
        yield put(router.push('/user/login'))
      }
    },
    *getUserMenu(payload, { call, put }) {
      let id;
      if (sessionStorage.getItem('is_supper') === 1) {
        id = 0;
      } else {
        let temp = sessionStorage.getItem('user')
        id = JSON.parse(temp).id;
      }

      const response = yield call(getUserMenu, id);
      yield put({
        type: 'updateMenu',
        payload: response.data.list,
      });
    },
    *getRoleMenu(payload, { call, put }) {
      let id;
      if (sessionStorage.getItem('is_supper') == 1) {
        id = 0;
      } else {
        let temp = sessionStorage.getItem('user');
        id = JSON.parse(temp).rid;
      }

      const response = yield call(getRoleMenu, id);
      yield put({
        type: 'updateMenu',
        payload: response.data.list,
      });
    },
    *getNotify(payload, { call, put, select }){
      const response = yield call(getNotify);
      yield put({
        type: 'updateNotify',
        payload: response.data.list,
      });
    },
    *patchNotify({ payload }, { call, put, select }){
      const response = yield call(patchNotify, payload);
      if (response && response.code === 200) {
        // yield put({
        //   type: 'getNotify',
        // });
      } else {
        message.error(response.msg);
      }
    },
    *getRole({payload}, { call, put }){
      const response = yield call(getRole);
      yield put({
        type: 'updateRoleList',
        payload: response.data,
      });
    },
    *getPerm({payload}, { call, put }) {
      let query;
      if (payload!==undefined) {
        query = {
          page: payload.page && payload.page || 0,
          pageSize: payload.pageSize && payload.pageSize || 10,
          pid: payload.pid  && payload.pid || '',
          name: payload.name && payload.name || '',
        };
      }

      const response = yield call(getPerm, query);
      yield put({
        type: 'updatePermList',
        payload: response.data,
      });
    },
    *permAdd({payload}, { call, put }){
      const response = yield call(permAdd, payload);
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getPerm',
        });
      } else {
        message.error(response.msg);
      }
    },
    *permEdit({payload}, { call, put}){
      console.log(payload);
      let temp = {};
      temp.pid  = payload.searchPid;
      temp.name = payload.serachName;
      delete payload.searchPid;
      delete payload.serachName;
      const response = yield call(permEdit, payload);
      if (response && response.code === 200) {
        delete payload.id;
        yield put({
          type: 'getPerm',
          payload: temp
        });
      } else {
        message.error(response.msg);
      }
    },
    *permDel({payload}, { call, put }){
      const response = yield call(permDel, payload.id);
      if (response && response.code === 200) {
        // 更新角色列表
        delete payload.id;
        yield put({
          type: 'getPerm',
          payload: payload
        });
      } else {
        message.error('删除错误， 请检查是否有依赖？');
      }
    },
    *getUser({payload}, { call, put, select }){
      if (payload) {
        yield put({
          type: 'updatePage',
          payload: payload,
        });
      }
      const state = yield select(state => state.system);
      const { page, pageSize } = state;
      const query = {
        page: page,
        pageSize: pageSize,
      };
      const response = yield call(getUser, query);
      yield put({
        type: 'updateUser',
        payload: response.data,
      });
    },
    *userAdd({payload}, { call, put }){
      const response = yield call(userAdd, payload);
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getUser',
        });
      } else {
        message.error(response.msg);
      }
    },
    *userEdit({payload}, { call, put }){
      const response = yield call(userEdit, payload);
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getUser',
        });
      } else {
        message.error(response.msg);
      }
    },
    *userDel({payload}, { call, put }){
      const response = yield call(userDel, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
        yield put({
          type: 'getUser',
        });
      }
    },
    *roleAdd({payload}, { call, put }){
      const response = yield call(roleAdd, payload);
      console.log(response)
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getRole',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleEdit({payload}, { call, put, select }){
      const response = yield call(roleEdit, payload);
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getRole',
        });
      } else {
        message.error(response.msg);
      }
    },
    *roleDel({payload}, { call, put, select }){
      const response = yield call(roleDel, payload);
      // response = JSON.paser(response);
      if (response && response.code === 200) {
        // 更新角色列表
        yield put({
          type: 'getRole',
        });
      }
    },
    *getAllPerm({payload}, { call, put, select }){
      const response = yield call(getAllPerm);
      if (response && response.code === 200 ) {
        yield put({
          type: 'updateAllPermList',
          payload: response.data.list,
        });
      }
    },
    *getUserPerm({payload}, { call, put }){
      const response = yield call(getUserPerm, payload);
      const temp = [];

      response.data.list.map(item => {
        // temp.push((item.Pid).toString());
        temp.push((item.pid));
      });

      yield put({
        type: 'updateUserPermList',
        payload: temp,
      });
    },
    *getRolePerm({payload}, { call, put }){
      const response = yield call(getRolePerm, payload);
      const temp = [];

      response.data.list.map(item => {
        // temp.push((item.Pid).toString());
        temp.push((item.pid));
      });

      yield put({
        type: 'updateRolePermList',
        payload: temp,
      });
    },

    *userPermAdd({payload}, { call, put, select }){
      let id = payload.id
      const response = yield call(userPermAdd, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'getUserPerm',
          payload: id,
        });
      } else {
        message.error(response.msg);
      }
    },
    *rolePermAdd({payload}, { call, put, select }){
      let id = payload.id
      const response = yield call(rolePermAdd, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'getRolePerm',
          payload: id,
        });
      } else {
        message.error(response.msg);
      }
    },
    *getMenu({payload}, { call, put, select }){
      if (payload) {
        yield put({
          type: 'updatePage',
          payload: payload,
        });
      }
      const state = yield select(state => state.system);
      const { page, pageSize } = state;
      const query = {
        type: 1,
        page: page,
        pageSize: pageSize,
      };

      const response = yield call(getMenu, query);

      yield put({
        type: 'updateMenuList',
        payload: response.data.list,
      });
    },
    *menuAdd({ payload }, { call }) {
      const response = yield call(menuAdd, payload);
      if (response && response.code === 200) {
        // 更新主菜单
        // yield put({
        //   type: 'getMenu',
        // });
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *menuEdit({ payload }, { call }) {
      const response = yield call(menuEdit, payload);
      if (response && response.code === 200) {
        // 更新主菜单
        // yield put({
        //   type: 'getMenu',
        // });
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *menuDel({ payload }, { call }) {
      const response = yield call(menuDel, payload);
      if (response && response.code === 200) {
        // 更新主菜单
        // yield put({
        //   type: 'getMenu',
        // });
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *getSubMenu({payload}, { call, put, select }){
      if (payload) {
        yield put({
          type: 'updatePage',
          payload: payload,
        });
      }
      const state = yield select(state => state.system);
      const { page, pageSize } = state;
      const query = {
        type: 1,
        isSubMenu: 1,
        page: page,
        pageSize: pageSize,
      };

      const response = yield call(getSubMenu, query);
      yield put({
        type: 'updateSubMenuList',
        payload: response.data,
      });
    },
    *subMenuAdd({ payload }, { call, put }) {
      const response = yield call(subMenuAdd, payload);
      if (response && response.code === 200) {
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *subMenuEdit({ payload }, { call, put }) {
      const response = yield call(subMenuEdit, payload);
      if (response && response.code === 200) {
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *subMenuDel({ payload }, { call, put }){
      const response = yield call(subMenuDel, payload);
      if (response && response.code === 200) {
        window.location.reload();
      } else {
        message.error(response.msg);
      }
    },
    *getSetting({payload}, { call, put, select }){
      const response = yield call(getSetting);
      yield put({
        type: 'updateSettingList',
        payload: response.data,
      });
    },
    *getSettingAbout({payload}, { call, put, select }){
      const response = yield call(getSettingAbout);
      yield put({
        type: 'updateSettingAbout',
        payload: response.data,
      });
    },
    *settingModify({payload}, { call, put, select }){
      const response = yield call(settingModify, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'getSetting',
        });
        message.success(response.msg);
      } else {
        message.error(response.msg);
      }
    },
    *settingMailTest({payload}, { call}){
      const response = yield call(settingMailTest, payload);
      if (response && response.code === 200) {
        message.success(response.msg);
      } else {
        message.error(response.msg);
      }
    },
    *settingLdapTest({payload}, { call}){
      const response = yield call(settingLdapTest, payload);
      console.log(response)
      if (response && response.code === 200) {
        message.success(response.msg);
      } else {
        message.error(response.msg);
      }
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const userJSON = sessionStorage.getItem('user');
        if (userJSON) {
          const user = JSON.parse(userJSON);
          dispatch({
            type: 'updateUser',
            payload: user,
          });
        }
        const pathname = location.pathname;
        if (pathname !== '/user/login') {
          const token = sessionStorage.getItem('jwt');
          const userJSON = sessionStorage.getItem('user');
          if (!token || !userJSON) {
            sessionStorage.removeItem('jwt');
            // 未登录访问
            router.push('/user/login');
          }
        }
      });
    },
  },
};
