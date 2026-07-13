import { CORE_REGISTRY } from './server/src/cores/index'
const historyCoreNames = ['Phoenix Core']
const needsHistory = historyCoreNames.some(name => {
  const strategy = CORE_REGISTRY[name.toLowerCase()]
  if (!strategy) return false
  return strategy.constructor.name === 'AegisCoreStrategy' || 
         strategy.constructor.name === 'MissionCoreStrategy' ||
         strategy.constructor.name === 'PhoenixCoreStrategy' ||
         name.toLowerCase() === 'harmony wave'
})
console.log("needsHistory:", needsHistory)
