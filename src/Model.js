import effect, { loading, failed, loaded } from './effect';

export const RestfulReducers = {
  listSuccess(state, action) {
    const {result={}, source={}} = action;
    return {
      ...loaded(state, action),
      list: result[source.result || 'list'],
      total:result.total
    };
  },
  itemSuccess(state, action) {
    const {result={}, source={}} = action;
    return {
      ...loaded(state, action),
      item: source.result ? result[source.result] : result
    };
  },
  createSuccess(state, action) {
    const { list = [], total = 0 } = state;
    const {result} = action;
    list.unshift(result);
    return {...loaded(state, action), list, total:total+1, item: result };
  },
  modifySuccess(state, action) {
    let { list } = state;
    if (list && list.length) {
      list = list.reduce((arr, it) => {
        arr.push(it.id != action.payload.id ? it : action.result);
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
      list = list.reduce((arr, it) => {
        if (it.id != action.payload.id) {
          arr.push(it);
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
    service_reducers[reducer] = RestfulReducers[reducer] || ((state, action) => ({...loaded(state, action), [key]: action.result }));
    return eff;
  }, {});

  const successReducers = Object.keys(reducers).reduce((m, key) => {
    if (/Success$/gi.test(key)) {
      if (typeof reducers[key] === 'string') {
        const _key = key.replace(/Success$/gi, '');
        m[key] = (state, action) => ({
            ...loaded(state, action),
            [_key]: reducers[key] === '' ? action.result : action.result[reducers[key]]
          });
      } else {
        m[key] = (state, action) => reducers[key](loaded(state, action), action);
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
