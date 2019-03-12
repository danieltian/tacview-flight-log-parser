import Vue from 'vue'
import Vuex from 'vuex'
import App from './components/App'
import parser from './flight-log-parser'

Vue.use(Vuex)

const store = new Vuex.Store({
  mutations: {
    setData(state, data) {
      store.replaceState(data)
    }
  },

  actions: {
    loadFiles({ commit }, files) {
      files = Array.from(files)

      files.forEach((file) => {
        let reader = new FileReader()
        reader.readAsText(file)

        reader.addEventListener('load', () => {
          let data = parser.parse(reader.result)
          commit('setData', data)
        })
      })
    }
  }
})

new Vue({
  el: '#app',
  store,
  render: (h) => h(App)
})