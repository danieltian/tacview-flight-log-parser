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

      let data = { entities: {}, categories: {}, files: files }

      let promises = files.map((file) => {
        let reader = new FileReader()
        reader.readAsText(file)

        return new Promise((resolve) => {
          reader.addEventListener('load', () => {
            parser.parse(reader.result, data)
            resolve(data)
          })
        })
      })

      Promise.all(promises).then(() => store.commit('setData', data))
    }
  }
})

new Vue({
  el: '#app',
  store,
  render: (h) => h(App)
})