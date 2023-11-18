import pylibi2c
from time import sleep
import os

IKB_1_ADDR = 0x48
    
i2c1 = pylibi2c.I2CDevice('/dev/i2c-2', IKB_1_ADDR, iaddr_bytes=0)

def write(wd):
    i2c1.write(0x0,bytes(wd))

def write_byte(wd):
    i2c1.write(0x0, wd)

def read(n):
    return i2c1.read(0x0,n)

def reset(wait=0.1):
    write([ 0x00 ])
    sleep(wait)

class Pin:
    OUT = 0
    IN = 1
    PULL_UP = 2

    def __init__(self, pin, mode=OUT, pull=None):
        if pin > 7:
            pin = 7
        if pin < 0:
            pin = 0
        self.pin = pin
        self.pull = pull

    def value(self, d=None):
        if d == None:
            write([ 0x08 + self.pin, 3 if self.pull == self.PULL_UP else 2 ])
            return read(1)[0]
        else:
            write([ 0x08 + self.pin, 1 if d else 0 ])
            return d

class ADC:
    def __init__(self, pin):
        self.pin = pin
    
    def read(self):
        write([ 0x80 + (self.pin << 4) ])
        sleep(0.1)
        d = read(2)
        print(d)
        return (d[0] << 8) | d[1]

class Motor:
    FORWARD = 1
    BACKWARD = 2
    STOP = 3

    def __init__(self, m, dir=STOP, speed=0):
        if m > 4:
            m = 4
        if m < 1:
            m = 1
        self._m = m
        self._dir = dir
        self._speed = speed
        self.update()

    def update(self):
        if self._dir == self.FORWARD:
            d = self._speed
        elif self._dir == self.BACKWARD:
            d = ((~self._speed) & 0xFF) + 1
        else:
            d = 0
        write([ 0x20 | (1 << (self._m - 1)), d ])

    def dir(self, dir=None):
        if dir != None:
            self._dir = dir
        return self._dir

    def speed(self, speed=None):
        speed = int(speed)
        if speed != None:
            if speed > 100:
                speed = 100
            if speed < 0:
                speed = 0
            self._speed = speed
        return self.speed

class Servo:
    def __init__(self, ch, angle=0):
        if ch > 6:
            ch = 6
        if ch < 1:
            ch = 1
        self.ch = ch
        self._angle = angle
    
    def angle(self, angle=None):
        if angle != None:
            angle = int(angle)
            if angle < 0:
                angle = 0
            if angle > 200:
                angle = 200
            self._angle = angle
            write([ 0x40 | (1 << (self.ch - 1)), self._angle ])
        return self._angle

class UART:
    def __init__(self, baudrate=9600, timeout=0.1, timeout_char=0.05):
        self.baudToBit = 0
        if baudrate == 2400:
            self.baudToBit = 0
        elif baudrate == 9600:
            self.baudToBit = 1
        elif baudrate == 57600:
            self.baudToBit = 2
        elif baudrate == 115200:
            self.baudToBit = 3

    def available(self):
        write([ 0x01 ])
        return read(1)[0]
    
    def read(self, nbytes=1):
        if nbytes > 0xFF:
            nbytes = 0xFF
        if nbytes <= 0:
            return b''
        write([ 0x02, nbytes ])
        return read(nbytes)

    def write(self, buf):
        write_byte(bytes([ 0x04 | self.baudToBit ]) + buf)

#reset()
