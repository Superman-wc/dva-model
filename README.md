# dva-model

## Install 安装
```
npm install dva-model
```

## Use 使用

```
import Model from 'dva-model';
import effect from 'dva-model/effect';
import {list, item, create, modify, remove, publish, unPublish} from './service/banner'; //远程API接口


export default Model({
  namespace:'banner',
  subscriptions: {
    setup({dispatch, history}) {
      history.listen(location =>dispatch({
        type: 'list',
        payload: location.query
      }));
    },
  },
  effects: {
    publish: effect(publish, 'modifySuccess'),
    unPublish: effect(unPublish, 'modifySuccess'),
  },
  reducers:{
    //以下自动生成
    //set(state, action:{payload}), // 将payload直接设置到state[namespace]中
    //clean(state, action:{payload}), //清除此名字空间下的所有state, 并重新设置成payload中传递的数据

    //以下视service中是否传入相应API而生成
    //listSuccess(state, action),   // 将result中的list, total设置到state[namespace]中
    //itemSuccess(state, action),   // 将result整体做为item 设置到state[namespace]中
    //createSuccess(state, action), // 同itemSuccess, 并total+1, list中添加item
    //modifySuccess(state, action), // 同itemSuccess, 并替换list中的item 根据id
    //removeSuccess(state, action), // total-1, list中删除此id的元素
  }
}, {
  list, item, create, modify, remove, //service api 会自动生成 effect与reducer
},{
  //cache 缓存机制， 可以将远程调用的结果缓存起来
  list: listCache, //对应到 effects.list 调用
  item: itemCache, //对应到 effects.item 调用
});
```


`Model(model, service, cache)` 会自动处理 effects 与 reducers，
并且effect 调用时会put({loading, apiName+'Loading'})到state[namespace];
effect结束时，loading, apiName+'Loading'会从state[namespce]中删除；



一般的 service 中定义远程调用接口
```
export async function list(data) {
  return request('/api/banner', {data, method: 'GET'});
}
```

### 后台返回的数据结构（JSON）
```
{
  status: number, //1：成功， 其他错误,
  code: number,   //错误码，
  message: string, //错误消息
  result:{          //成功时的返回数据  //itemSuccess 会将此整体做为item设置到state

    // listSuccess 会将此数据设置到state中
    list: [],      // RESTFul index
    total: number, // RESTFul index, 记录总数，可用于分页

    id,             // RESTFul show upadte(PUT) patch(PATCH) delete(DELETE)
  }
}
```

### Cache 缓存

```
function Cache(data){
  if(!!data){
    //存
  }else{
    return {} //取
  }
}
Cahce.clean = function(){} //清除
```

