export default {
  name: "MQTT",    
  description: "MQTT Plugin for connecting to MQTT broker and publish/subscribe messages.",
  category: "Communication",    
  author: "comdet",
  version: "1.0.0",
  icon: "/static/MQTT.png",
  color: "#8b507c",
  blocks: [
    "mqtt_config",
    "mqtt_on_connected",
    "mqtt_is_connect",
    "mqtt_publish",
    "mqtt_subscribe",
    "mqtt_on_message",

    //"mqtt_loop",
    "mqtt_get_topic",
    "mqtt_get_number",
    "mqtt_get_text",
  ],
}
