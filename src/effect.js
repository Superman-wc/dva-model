import isFunction from 'lodash.isfunction';

function afterSuccess(success){
  return 'after' + success.substr(0, 1).toUpperCase() + success.substr(1);
}

/**
 * 创建Effect方法
 * @param api       服务方法
 * @param success   成功时reducers
 * @param cache     可选，缓存判断方法
 * @param name      可选，缓存取出后放到result的字段名
 * @returns {Function}
 */
export default function effect(opt = {}) {
  if (arguments.length === 1) {
    var {api, success, cache, name, callback} = opt;
  } else {
    var [api, success, cache, name, callback] = arguments;
    if (arguments.length === 4 && isFunction(name)) {
      callback = name;
      name = null;
    }
  }

  return (
    function*(action, saga) {
      action._name = action.type.split('/');
      action._name = action._name[action._name.length - 1];
      const {payload} = action;
      if (cache) {
        var ca = cache(null, action);
        if (ca) {
          const result = name ? {[name]: ca} : ca;
          const _action = {
            type: action.success || success,
            result,
            payload,
            source: action
          };
          yield saga.put(_action);
          yield saga.put({
            ..._action,
            type: action.afterSuccess || afterSuccess(success),
          });
          isFunction(callback) && callback(result);
          isFunction(action.callback) && action.callback(result);
          isFunction(action.resolve) && action.resolve(result);
          return result;
        }
      }
      try {
        const loadingAction = {type: 'loading', source: action};
        yield saga.put(loadingAction);
        isFunction(effect.loading) && effect.loading(loadingAction);
        var {result, err} = yield saga.call(api, payload);
        if (err) {
          throw err;
        } else {
          cache && cache(result, action);
          const _action = {
            type: action.success || success,
            result,
            payload,
            source: action
          };
          yield saga.put(_action);
          yield saga.put({
            ..._action,
            type: action.afterSuccess || afterSuccess(success),
          });
          isFunction(effect.loaded) && effect.loaded(result);
          isFunction(callback) && callback(result);
          isFunction(action.callback) && action.callback(result);
          isFunction(action.resolve) && action.resolve(result);
          return result;
        }
      } catch (ex) {
        console.error(ex);
        yield saga.put({
          type: 'failed',
          err: ex,
          source: action
        });
        if(isFunction(action.reject)){
          action.reject(ex)
        }else if(isFunction(effect.error)){
          effect.error(ex)
        }else{
          throw ex;
        }
      }
    }
  );
}

/**
 * 加载状态
 * @param state
 * @param action
 * @returns {{loading: boolean}}
 */
export function loading(state, action) {
  return {...state, loading: true, [action.source._name + 'Loading']: true};
}

export function loaded(state, action) {
  delete state.loading;
  const source = action.source;
  let key;
  if (source) {
    key = action.source._name;
  } else {
    key = action.type.split('/');
    key = (key[key.length - 1] + '').replace(/Success$/g, '');
  }
  delete state[key + 'Loading'];
  return state;
}

/**
 * 失败状态
 * @param state
 * @param action
 * @returns {{ err: (*|Error)}}
 */
export function failed(state, action) {
  return {...loaded(state, action), err: action.err};
}

