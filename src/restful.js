/**
 * 获取列表接口返回的处理方法
 * @param state
 * @param action
 * @returns {{total: number, list: Array}}
 */
export function listSuccess(state, action) {
  const { payload = {}, source = {} } = action;
  let { list = [], total = 0, ...otherPayoad } = payload;
  if (source.loadNext) {
    list = (state.list || []).concat(list);
  }
  return { ...state, ...otherPayoad, total, list };
}

/**
 * 获取单例实例接口返回的处理方法
 * @param state
 * @param action
 * @returns {{item}}
 */
export function itemSuccess(state, action) {
  return { ...state, item: action.payload };
}

/**
 * 创建实例
 * @param state
 * @param action
 * @returns {{total: number, item: *, list: *[]}}
 */
export function createSuccess(state, action) {
  const { list = [], total = 0 } = state;
  const { payload } = action;
  return { ...state, list: [payload, ...list], total: total + 1, item: payload };
}

/**
 * 修改实例
 * @param state
 * @param action
 * @returns {{item, list: Array}}
 */
export function modifySuccess(state, action) {
  let { list = [] } = state;
  const { payload = {}, source = {} } = action;
  if (list && list.length) {
    list = list.reduce((arr, it) => {
      arr.push(it.id == payload.id ? (source.merge ? { ...it, ...payload } : payload) : it);
      return arr;
    }, []);
  }
  return { ...state, list, item: payload };
}

/**
 * 删除实例
 * @param state
 * @param action
 * @returns {{total: *, list: *}}
 */
export function removeSuccess(state, action) {
  let { item, list, total } = state;
  if (item && item.id == action.payload.id) {
    delete state.item;
  }
  if (total) {
    total = total - 1;
  }
  if (list && list.length) {
    list = list.reduce((arr, it) => {
      if (it.id != action.payload.id) {
        arr.push(it);
      }
      return arr;
    }, []);
  }
  return { ...state, list, total };
}

export default {
  listSuccess,
  itemSuccess,
  createSuccess,
  modifySuccess,
  removeSuccess
}
