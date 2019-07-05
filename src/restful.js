export function listSuccess(state, action) {
  const { payload = {}, source = {} } = action;
  let { list = [], total = 0, ...otherPayoad } = action;
  if (source.loadNext) {
    list = (state.list || []).concat(list);
  }
  return { ...state, ...otherPayoad, total, list };
}

export function itemSuccess(state, action) {
  return { ...state, item: action.payload };
}

export function createSuccess(state, action) {
  const { list = [], total = 0 } = state;
  const { payload } = action;
  return { ...state, list: [...list, payload], total: total + 1, item: payload };
}

export function modifySuccess(state, action) {
  let { list = [] } = state;
  const { payload = {}, source = {} } = action;
  if (list && list.length) {
    list = list.reduce((arr, it) => {
      arr.push(it.id == payload.id ? (source.merge ? { ...it, ...payload } : payload) : it);
      return arr;
    }, []);
  }
  return { ...loaded(state, action), list, item: payload };
}

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
