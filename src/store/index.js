import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export const createStore = () => {
  return new Vuex.Store({
    state: () => ({ // 防止交叉请求带来的数据状态污染
      posts: []
    }),

    mutations: {
      setPosts(state, data) {
        state.posts = data
      }
    },

    actions: {
      // 在服务端渲染期间务必让 action 返回一个Promise
      async getPosts({ commit }) { // async 默认返回Promise
        // return new Promise()
        const { data } = await axios.get('https://cnodejs.org/api/v1/topics')
        commit('setPosts', data.data)
      }
    }
  })
}
