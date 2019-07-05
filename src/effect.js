/**
 * 创建Effect方法
 * @param api       服务方法
 * @param success   成功时reducers
 * @param fail      失败时reducers
 * @param cache     可选，缓存方法
 * @returns {Function}
 */
export default function effect(api, success, fail = 'failed', cache = null) {
  return (
    function* (action, saga) {
      if (cache) {
        const payload = cache(null, action);
        if (payload) {
          yield saga.put({
            type: action.success || success,
            payload,
            source: action,
          });
        }
      }

      const { result, error } = yield saga.call(api, action.payload);
      if (error) {
        console.error(error);
        error.action = action; // 如果可以的话，在处理完错误后重新dispatch(action);
        if (action.reject) {
          action.reject(error);
        }
        yield saga.put({
          type: action.fail || fail,
          payload: error,
          source: action,
        });
      } else {
        if (cache) {
          cache(result, action);
        }
        if (action.resolve) {
          action.resolve(result);
        }
        yield saga.put({
          type: action.fail || success,
          payload: result,
          source: action,
        });
      }
    }
  );
}
