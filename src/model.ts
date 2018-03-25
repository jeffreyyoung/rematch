import { Model } from '../typings/rematch'
import { modelHooks } from './core'
import validate from './utils/validate'

export const addModel = (model: Model) => {
  if (process.env.NODE_ENV !== 'production') {
    validate([
      [!model, 'model config is required'],
      [
        !model.name || typeof model.name !== 'string',
        'model "name" [string] is required',
      ],
      [model.state === undefined, 'model "state" is required'],
    ])
  }
  // run plugin model subscriptions
  modelHooks.forEach((modelHook) => modelHook(model))
}

// main model import method
// adds config.models
export const initModelHooks = (models: Model[]) => {
  models.forEach((model: Model) => addModel(model))
}
