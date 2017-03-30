import effect, { loading, failed, loaded } from './effect';

export const RestfulReducers = {
  listSuccess(state, action) {
    const { total } = action.result;
    const list = action.result[action.source && action.source.result || 'list'];
    return {...loaded(state, action), list, total };
  },
  itemSuccess(state, action) {
    return {
      ...loaded(state, action),
      item: (action.source && action.source.result) ? action.result[action.source.result] : action.result
    };
  },
  createSuccess(state, action) {
    let { list = [], total = 0 } = state;
    list.unshift(action.result);
    total += 1;
    return {...loaded(state, action), list, total, item: action.result };
  },
  modifySuccess(state, action) {
    let { list } = state;
    if (list && list.length) {
      list = list.reduce((arr, cur) => {
        if (cur.id != action.payload.id) {
          arr.push(cur);
        } else {
          arr.push(action.result);
        }
        return arr;
      }, []);
    }
    return {...loaded(state, action), list, item: action.result };
  },
  removeSuccess(state, action) {
    let { item, list, total } = state;
    if (item && item.id == action.payload.id) {
      delete state.item;
    }
    if (total) {
      total = total - 1;
    }
    if (list && list.length) {
      list = list.reduce((arr, cur) => {
        if (cur.id != action.payload.id) {
          arr.push(cur);
        }
        return arr;
      }, []);
    }
    return {...loaded(state, action), list, total };
  },
};

export default function Model({
  namespace = "",
  state = {},
  effects = {},
  reducers = {},
  subscriptions = {}
}, service = {}, caches = {}) {
  const service_reducers = {};
  const service_effects = Object.keys(service).reduce((eff, key) => {
    const reducer = key + 'Success';
    eff[key] = effect(service[key], reducer, caches[key]);
    service_reducers[reducer] = RestfulReducers[reducer] || ((state, action) => {
      return {...loaded(state, action), [key]: action.result };
    });
    return eff;
  }, {});

  const successReducers = Object.keys(reducers).reduce((m, key) => {
    if (/Success$/gi.test(key)) {
      if (typeof reducers[key] === 'string') {
        const _key = key.replace(/Success$/gi, '');
        m[key] = (state, action) => {
          return {
            ...loaded(state, action),
            [_key]: reducers[key] === '' ? action.result : action.result[reducers[key]]
          };
        }
      } else {
        m[key] = (state, action) => {
          return reducers[key](loaded(state, action), action);
        }
      }
    } else {
      m[key] = reducers[key];
    }
    return m;
  }, {});

  const model = {
    namespace,
    state: {...state },
    subscriptions: {...subscriptions },
    effects: {
      ...service_effects,
      ...effects
    },
    reducers: {
      loading,
      failed,
      set(state, action) {
        return {...state, ...action.payload };
      },
      clean(state, action) {
        return {...action.payload };
      },
      ...service_reducers,
      ...successReducers
    }
  };
  return model;
};
