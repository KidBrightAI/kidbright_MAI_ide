const internalState = {
  sessionid: "",
  item: "",
  userid: "",
  email: "ning.trat@gmail.com",
  ssid: "",
  project:null,
  datasetCount: 0,
  snapCount: 0,
  ip: "123",
  duration: 0,
  ifCount: 0,
  labelCount:0,
  aistep:"",
}
  
export const aev = new Proxy(internalState, {
  get(target, property) {
    if (property in target) {
      //console.log(`Getting ${property}: ${target[property]}`);
      return target[property]
    } else {
      console.warn(`Property "${property}" does not exist.`)
      
      return undefined
    }
  },
  set(target, property, value) {
    if (property in target) {
      //console.log(`[aev] set ${property} to ${value}`);
      target[property] = value
      
      return true
    } else {
      console.warn(`Cannot set unknown property "${property}"`)
      
      return false
    }
  },
})



// export function updateCounter(value) {
// globalState.counter += value;
// }