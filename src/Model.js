import effect from './effect';
import restful from './restful';


export default function Model({
                                namespace,
                                state = {},
                                effects = {},
                                reducers = {},
                                subscriptions = {},
                              }, service = {}, caches = {}) {
  const service_reducers = {};
  const service_effects = Object.keys(service).reduce((eff, key) => {
    const reducer = `${key}Success`;
    eff[key] = effect(service[key], reducer, `${key}Failed`, caches[key]);
    service_reducers[reducer] = restful[reducer] || ((state, action) => ({...state, [key]: action.payload}));
    return eff;
  }, {});

  const successReducers = Object.keys(reducers).reduce((m, key) => {
    if (/Success$/gi.test(key)) {
      if (typeof reducers[key] === 'string') {
        const _key = key.replace(/Success$/gi, '');
        m[key] = (state, action) => ({
          ...state,
          [_key]: reducers[key] === '' ? action.payload : action.payload[reducers[key]]
        });
      } else {
        m[key] = (state, action) => reducers[key](state, action);
      }
    } else {
      m[key] = reducers[key];
    }
    return m;
  }, {});

  return {
    namespace,
    state,
    subscriptions,
    effects: {
      ...service_effects,
      ...effects,
    },
    reducers: {
      set(state, action) {
        return {...state, ...action.payload};
      },
      clean(state, action) {
        return {...action.payload};
      },
      ...service_reducers,
      ...successReducers
    }
  };
};
