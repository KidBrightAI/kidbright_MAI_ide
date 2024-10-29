import json
import threading
import mqttclient as MQTT

MIN_DELAY = 1
MAX_DELAY = 15

MQTT_ADDRESS = "mqtt.netpie.io"
MQTT_PORT = 1883
MQTT_KEEPALIVE = 30

MQTT_STATE_DISCONNECTED  = 0
MQTT_STATE_CONNECTING    = 1
MQTT_STATE_CONNECTED     = 2

class Microgear:
    def mg_message_cb(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode()
        if topic.startswith('@msg/'):
            for tc in self.topic_callbacks:
                if self.topicMatched(tc[0],topic):
                    tc[1](topic, payload)
        elif topic == '@shadow/data/updated':
            try:
                sobj = json.loads(payload)
                for sc in self.shadowupdated_callbacks:
                    sc(sobj['data'])
            except KeyError as e:
                    pass
        elif topic == '@private/shadow/data/get/response':
            sobj = json.loads(payload)
            for sgc in self.shadowget_callbacks:
                sgc(sobj)
            self.shadowget_callbacks.clear()

    def mg_connected_cb(self, client, userdata, flags, rc):
        if rc == 0:
            self.mqtt_state = MQTT_STATE_CONNECTED

            for t in self.topic_subscriptions:
                self.mqttclient.subscribe(t)
            for c in self.connected_callbacks:
                c()
        else:
            pass

    def mg_disconnected_cb(self):
        self.mqtt_state = MQTT_STATE_DISCONNECTED
        for c in self.disconnected_callbacks:
            c()

    def __init__(self, deviceid=None, devicetoken=None):

        self.mqtt_state = MQTT_STATE_DISCONNECTED
        self.deviceid = deviceid
        self.devicetoken = devicetoken
        self.connected_callbacks = []
        self.topic_callbacks = []
        self.disconnected_callbacks = []
        self.shadowupdated_callbacks = []
        self.topic_subscriptions = []
        self.shadowget_callbacks = []

    def setDeviceCredential(self, deviceid, devicetoken):
        self.deviceid = deviceid
        self.devicetoken = devicetoken

    def on(self, event, cb):
        if   event == 'Message' :
            self.topic_callbacks.append(['@msg/#', cb])
        elif event == 'ShadowUpdated' :
            self.shadowupdated_callbacks.append(cb)
        elif event == 'Connected' :
            self.connected_callbacks.append(cb)
        elif event == 'Disconnected' :
            self.disconnected_callbacks.append(cb)
        elif event.startswith('@msg/'):
            self.topic_callbacks.append([event, cb])
        elif event == '@shadow/data/updated':
            self.shadowupdated_callbacks.append(cb)
        elif event.startswith('@private/'):
            self.topic_callbacks.append([event, cb])

    def subscribe(self, topic):
        if topic not in self.topic_subscriptions:
            self.topic_subscriptions.append(topic)
        if self.mqtt_state == MQTT_STATE_CONNECTED:
            self.mqttclient.subscribe(topic)

    def check_msg(self):
        if (self.mqtt_state) == MQTT_STATE_CONNECTED:
            return self.mqttclient.check_msg()
        elif (self.mqtt_state == MQTT_STATE_DISCONNECTED):
            # print("reconnected...")
            self.mqttclient.connect()

    def mqtttask(self):
        self.mqttclient.loop_forever()

    def connect(self):
        if bool(self.deviceid) and bool(self.devicetoken) and self.mqtt_state==MQTT_STATE_DISCONNECTED :
            self.mqtt_state = MQTT_STATE_CONNECTING
            self.mqttclient = MQTT.Client(client_id=self.deviceid)
            self.mqttclient.username_pw_set(self.devicetoken, '')
            self.mqttclient.on_connect = self.mg_connected_cb
            self.mqttclient.on_message = self.mg_message_cb
            self.mqttclient.reconnect_delay_set(min_delay=MIN_DELAY, max_delay=MAX_DELAY)
            self.mqttclient.connect(MQTT_ADDRESS, MQTT_PORT, MQTT_KEEPALIVE)
            mqtt_thread_instance = threading.Thread(target=self.mqtttask, args=())
            mqtt_thread_instance.start()

    def getShadowData(self, cb):
        if self.mqtt_state == MQTT_STATE_CONNECTED:
            self.shadowget_callbacks.append(cb)
            self.mqttclient.publish('@shadow/data/get','')

    def publish(self, topic, payload):
        if self.mqtt_state == MQTT_STATE_CONNECTED:
            self.mqttclient.publish(topic, payload)

    def push(self, title, body):
        p = {
            "title": title,
            "body": body
        }
        jstr = json.dumps(p)
        self.publish('@push', jstr)

    def writeShadowField(self, field, value):
        def covertDotNotationToJSON(path, val):
            value = None
            out = {}
            a = path.split('.')
            for i in range(len(a)-1, -1, -1) :
                if value is None :
                    out[a[i]] = val
                else:
                    out[a[i]] = value.copy()

                value = out;
                out = {}
            return value;
        
        payload = json.dumps({'data': covertDotNotationToJSON(field, value)})
        if self.mqtt_state == MQTT_STATE_CONNECTED:
            self.mqttclient.publish('@shadow/data/update', payload)
        else:
            self.connect()

    def topicMatched(self, sub, topic):
        s = 0
        t = 0
        while s<len(sub):
            if sub[s] == '#':
                if s+1 == len(sub): return 1
                else: return 0
            elif sub[s] == '+':
                if t == len(topic) or (s+1<len(sub) and sub[s+1]!='/'): return 0
            else:
                while s<len(sub) and sub[s]!='/' and t<len(topic) and topic[t]!='/':
                    if sub[s]!=topic[t]: return 0
                    s = s+1
                    t = t+1
                if (s<len(sub) and sub[s]!='/') or (t<len(topic) and topic[t]!='/'): return 0

            while s<len(sub) and sub[s]!='/': s=s+1
            while t<len(topic) and topic[t]!='/':t=t+1

            if s<len(sub) and sub[s]=='/': s = s+1
            if t<len(topic) and topic[t]=='/': t = t+1

        if t == len(topic): return 1
        else: return 0
