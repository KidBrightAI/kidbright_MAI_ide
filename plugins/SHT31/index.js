export default {
  name: "SHT31",    
  description: {
    en: "Humidity and Temperature Sensor",
    th: "เซนเซอร์วัดความชื้นและอุณหภูมิ",
  },
  category: "Sensors",    
  author: "comdet",
  version: "1.0.0",
  icon: "/static/dht11.png",
  color: "#8b507c",
  boards: ['kidbright-mai'],
  blocks: [
    "sht31_i2c_sensor",
  ],
}
