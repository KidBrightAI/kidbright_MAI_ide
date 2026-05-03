export default {
  name: "SHT31 uAiP",    
  description: "Humidity and Temperature Sensor",
  category: "Sensors",    
  author: "comdet",
  version: "1.0.0",
  icon: "/static/dht11.png",
  color: "#8b507c",
  boards: ['kidbright-mai-plus'],
  blocks: [
    "sht31_i2c_sensor_uAiP",
  ],
}
