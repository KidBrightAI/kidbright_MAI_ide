from maix import pwm
import time

class V831Servo:
    def __init__(self, pin):
        # all units are in ns
        self.pin = pwm.PWM(pin)
        self.pin.export()
        self.max_period = 1966 * 1000 * 1000
        self.pin.period = self.max_period
        self.min = 1655 * 1000 * 1000 # 0.6ms2
        self.max = 1895 * 1000 * 1000 # 2.5ms
        self.angle = 0
        self.pin.duty_cycle = self.min  
        self.pin.enable = True

    def set_angle(self, angle):
        if angle < 0:
            angle = 0
        elif angle > 180:
            angle = 180
        self.angle = angle
        # print("angle: ", angle)
        target_duty_cycle = int((angle / 180 * (self.max - self.min) + self.min))
        # swap max and min
        target_duty_cycle = self.max + self.min - target_duty_cycle  
        #print("target_duty_cycle: ", target_duty_cycle / 1000 / 1000)    
        self.pin.duty_cycle = target_duty_cycle

    def get_angle(self):
        return self.angle

    def deinit(self):
        self.pin.enable = False        
        self.pin.unexport()
