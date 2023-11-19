import machine
import time

class DHT11:
    def __init__(self, pin):
        self.pin = gpio.gpio(pin, "H", 1, line_mode = 2)
    
    def read(self):
        data = bytearray(5)
        buf = bytearray(1)
        idx = 0
        bits = 0
        
        self.pin.init(machine.Pin.OUT)
        self.pin.value(0)
        time.sleep_ms(18)
        self.pin.value(1)
        time.sleep_us(40)
        self.pin.init(machine.Pin.IN)
        
        while True:
            val = self.pin.value()
            if val != buf[0]:
                buf[0] = val
                if bits >= 8:
                    data[idx] = (data[idx] << 1) | buf[0]
                else:
                    bits += 1
            else:
                if bits >= 8:
                    bits = 0
                    idx += 1
                    if idx >= len(data):
                        break
        
        if data[4] == (data[0] + data[1] + data[2] + data[3]) & 0xFF:
            humidity = data[0]
            temperature = data[2]
            return temperature, humidity
        else:
            return None
