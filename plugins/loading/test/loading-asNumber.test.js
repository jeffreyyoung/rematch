const delay = ms => new Promise(r => setTimeout(r, ms))

xdescribe('loading asNumbers', () => {
  let count, init, dispatch, loadingPlugin

  beforeEach(() => {
    loadingPlugin = require('../src').default

    const rm = require('../../../src')
    init = rm.init
    dispatch = rm.dispatch

    count = {
      state: 0,
      reducers: {
        addOne: s => s + 1
      },
      effects: {
        async timeout() {
          await delay(200)
          this.addOne()
        }
      }
    }
  })

  afterEach(() => {
    jest.resetModules()
  })

  test('loading.global should be 0 for normal dispatched action', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.addOne()
    expect(store.getState().loading.global).toBe(0)
  })

  test('loading.global should be 1 for a dispatched effect', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    expect(store.getState().loading.global).toBe(1)
  })

  test('loading.global should be 2 for two dispatched effects', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    dispatch.count.timeout()
    expect(store.getState().loading.global).toBe(2)
  })

  test('should set loading.models[name] to 0', () => {
    const {
      init
    } = require('../../../src')
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    expect(store.getState().loading.models.count).toBe(0)
  })

  test('should change the loading.models to 1', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    expect(store.getState().loading.models.count).toBe(1)
  })

  test('should change the loading.models to 2', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    dispatch.count.timeout()
    expect(store.getState().loading.models.count).toBe(2)
  })

  test('should set loading.effects[name] to object of effects', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })
    expect(store.getState().loading.effects.count.timeout).toBe(0)
  })

  test('should change the loading.effects to 1', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    expect(store.getState().loading.effects.count.timeout).toBe(1)
  })

  test('should change the loading.effects to 2', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    dispatch.count.timeout()
    dispatch.count.timeout()
    expect(store.getState().loading.effects.count.timeout).toBe(2)
  })

  test('should capture all model and global loading for simultaneous effects', async () => {
    count = {
      state: 0,
      effects: {
        async timeout1() {
          await delay(200)
        },
        async timeout2() {
          await delay(200)
        }
      }
    }
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    const effect1 = dispatch.count.timeout1()
    await delay(100)
    const effect2 = dispatch.count.timeout2()

    const ld = () => store.getState().loading
    expect(ld().effects.count.timeout1).toBe(1)
    expect(ld().effects.count.timeout2).toBe(1)
    expect(ld().models.count).toBe(2)
    expect(ld().global).toBe(2)

    await effect1
    expect(ld().effects.count.timeout1).toBe(0)
    expect(ld().effects.count.timeout2).toBe(1)
    expect(ld().models.count).toBe(1)
    expect(ld().global).toBe(1)

    await effect2
    expect(ld().effects.count.timeout1).toBe(0)
    expect(ld().effects.count.timeout2).toBe(0)
    expect(ld().models.count).toBe(0)
    expect(ld().global).toBe(0)
  })

  test('should configure the loading name to "foobar"', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true, name: 'foobar' })]
    })

    dispatch.count.addOne()
    expect(store.getState().foobar.global).toBe(0)
  })

  test('should throw if loading name is not a string', () => {
    const createStore = () => init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        name: 42
      })]
    })

    expect(createStore).toThrow()
  })

  test('should block items if not in whitelist', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        whitelist: ['some/action'],
      })]
    })

    dispatch.count.timeout()
    expect(store.getState().loading.models.count).toBe(0)
  })

  test('should block items if in blacklist', () => {
    const store = init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        blacklist: ['count/timeout'],
      })]
    })

    dispatch.count.timeout()
    expect(store.getState().loading.models.count).toBe(0)
  })

  test('should throw if whitelist is not an array', () => {
    const createStore = () => init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        whitelist: 'some/action',
      })]
    })

    expect(createStore).toThrow()
  })

  test('should throw if blacklist is not an array', () => {
    const createStore = () => init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        blacklist: 'some/action',
      })]
    })

    expect(createStore).toThrow()
  })

  test('should throw if contains both a whitelist & blacklist', () => {
    const createStore = () => init({
      models: { count },
      plugins: [loadingPlugin({
        asNumber: true,
        whitelist: ['some/action'],
        blacklist: ['some/action'],
      })]
    })

    expect(createStore).toThrow()
  })

  test('should handle "hide" if effect throws', async () => {
    count = {
      state: 0,
      effects: {
        throwError() {
          throw new Error('effect error')
        }
      }
    }
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    try {
      await dispatch.count.throwError()
    } catch (err) {
      expect(store.getState().loading.global).toBe(0)
    }
  })

  test('should trigger three actions', async () => {
    let actions = []
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })],
      redux: {
        middlewares: [() => () => action => {
          actions.push(action.type)
        }]
      }
    })

    await dispatch.count.timeout()
    expect(actions).toEqual(['loading/show', 'count/addOne', 'loading/hide'])
  })

  test('should allow the propagation of the error', async () => {
    count = {
        state: 0,
        effects: {
            throwError() {
                throw new Error('effect error')
            }
        }
    }
    const store = init({
        models: { count },
        plugins: [loadingPlugin({ asNumber: true })]
    })

    try {
        await dispatch.count.throwError()
    } catch (err) {
        expect(err.message).toBe('effect error')
    }
  })

  test('should allow the propagation of the meta object', async () => {
    count = {
      state: 0,
      effects: {
        doSomething(payload, state, meta) {
          expect(meta).toEqual({ metaProp: 1 })
        }
      }
    }
    const store = init({
      models: { count },
      plugins: [loadingPlugin({ asNumber: true })]
    })

    try {
      await dispatch.count.doSomething(null, { metaProp: 1 })
    } catch (err) {
      throw err
    }
  })
})
