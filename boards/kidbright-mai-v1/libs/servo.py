class PWM:
    def pwm_reg_get(self,reg_add): 
        reg_value = None
        reg_addr  = None                                                    
        with open("/sys/class/sunxi_dump/dump","wb") as f:    
            reg_addr = bytes(hex(reg_add), 'ascii')           
            f.write(reg_addr)                                 
        with open("/sys/class/sunxi_dump/dump","rb") as f:                  
            reg_value = f.read()                                            
            reg_value = reg_value[:-1]                                      
        out_add = 'Reg  addr : ' + hex(reg_add)                             
        out_val = 'Read value: ' + bytes.decode(reg_value, encoding='ascii')
        print(out_add + ", " + out_val)

    def pwm_reg_set(self,reg_add, reg_val):
        with open("/sys/class/sunxi_dump/write","wb") as f:                 
            reg_set = hex(reg_add) + ' ' + hex(reg_val)
            reg_set = bytes(reg_set, 'ascii')
            f.write(reg_set)

    def __init__(self, num, frequency=100):
        # check if pwm between 0-9
        if num < 0 or num > 9:
            raise ValueError('PWM number must be between 0 and 9')
        # check if pwm is already exported        
        from maix import pwm
        self.pwm = pwm.PWM(num)
        self.pwm.export()
        self.frequency = frequency
        
        self.register_clock_base = 0x0300A000        

        self.register_control_address = 0x0100 + 0x0000 + num * 0x20 # num = 6 => 0x1c0, num = 7 => 0x1e0, num = 8 => 0x200
        self.register_period_address = 0x0100 + 0x0004 + num * 0x20 # num = 6 => 0x1c4, num = 7 => 0x1e4, num = 8 => 0x204
        self.register_counter_address = 0x0100 + 0x0008 + num * 0x20 # num = 6 => 0x1c8, num = 7 => 0x1e8, num = 8 => 0x208

        self.register_control_address += self.register_clock_base
        self.register_period_address += self.register_clock_base
        self.register_counter_address += self.register_clock_base
        
        #print('Control register address:', hex(self.register_control_address))
        #print('Period register address:', hex(self.register_period_address))
        #print('Counter register address:', hex(self.register_counter_address))
        
        # --- how to calculate the period and counter values ---
        # V831 has 10 PWM channels, divided to 5 pairs pwm01, pwm23, pwm45, pwm67, pwm89
        # Clock src is 24MHz, frequency range = 0 - 24/100MHz (240KHz)
        # clock control register 107Hex = 0b000100000111 bit 0-7 prescale , bit 9 = 0= cycle mode, 1 = pulse
        # clock period register 108Hex = 31:16 entire period, 15:0 cycle period
        # clock in 16 bit = 6mhz = 24mhz/4 so

        # 8 = 375khz off time
        # 16 = 187.5khz off time
        # 32 = 93.75khz off time
        # 64 = 46.875khz off time
        # 128 = 23.4375khz off time        
        # 256 = 11.71875khz off time
        # 512 = 5.859375khz off time
        # 1024 = 2.9296875khz off time
        
        # 10000 cycles = 300Hz = 150
        # 20000 cycles = 150Hz = 50
        # 30000 cycles = 100Hz = 25
        # 40000 cycles = 75Hz  = 15
        # 50000 cycles = 60Hz  = 10      
        # 60000 cycles = 50Hz  = 0
        # formula: cycles = 3000000 / frequency
        
        # max 16 bit = 65535 cycles
        #convert frequency to cycles from above example
        self.cycles = int(3000000 / frequency)

        self.pwm_reg_set(self.register_control_address, 0x00000107) # sets PWM when the level is valid, the level is 1,8 points frequency frequency
        self.pwm_reg_set(self.register_period_address, (self.cycles << 16) + (0)) # The setting frequency is 60,000 cycles, and the duty cycle is 30,000 cycles
        self.pwm_reg_set(self.register_counter_address, 0x00000000) # counter is initialized to 0
        
        self.pwm.enable = True
        # system("echo 0x0300A080 0x00 > write");  //PWM DISABLE
        # system("echo 0x0300A040 0x00  > write");//PWM CLOCK DISABLE, 0xc0 = 6,7,8, 0x1D9 = PWM4 6,7,8
        
        # self.pwm_reg_set(0x0300A1C0, 0x00000107)              # PCR6 sets PWM when the level is valid, the level is 1,8 points frequency frequency
        # self.pwm_reg_set(0x0300A1C4, (60000 << 16) + (30000)) # PPR6 The setting frequency is 60,000 cycles, and the duty cycle is 30,000 cycles
        # self.pwm_reg_set(0x0300A1C8, 0x00000000)              # PCNTR6 counter is initialized to

        #system("echo 0x0300A040 0x1D0 > write");//PWM CLOCK GATING Open PWM4 6,7,8 clock
        #self.pwm_reg_get(0x0300A040) # The clock source of obtaining PCGR = 0x000000c0 PWM67 has been opened
        
        #system("echo 0x0300A02C 0x00 > write");//PWM67 CLOCK CONFIG PCCR67 24M 不分频                                             
        #self.pwm_reg_get(0x0300A02C) # Get PCCR67=0x00000000 configuration to 24MHz clock, regardless of frequency

        #self.pwm_reg_get(0x0300A080) # 获取PER=0x000000c0     使能pwm6,7                                                                                                             
                                                                                
    def duty_cycle_percentage(self, duty_cycle_percentage):
        target_duty_cycle = int((duty_cycle_percentage / 100 * self.cycles))
        #print("target_duty_cycle: ", target_duty_cycle, " cycles: ", self.cycles)
        self.pwm_reg_set(self.register_period_address, (self.cycles << 16) + (target_duty_cycle))

    def duty_cycle_ms(self, duty_cycle_ms):
        total_priod_ms = 1 / (self.frequency / 1000) # 20ms
        target_duty_cycle_ms_percentage = duty_cycle_ms / total_priod_ms # 0.5
        target_duty_cycle = int(target_duty_cycle_ms_percentage * self.cycles)
        #print("target_duty_cycle: ", target_duty_cycle, " cycles: ", self.cycles)
        self.pwm_reg_set(self.register_period_address, (self.cycles << 16) + (target_duty_cycle))

    def unexport(self):
        self.pwm.enable = False
        self.pwm.unexport()

class V831Servo:
    def __init__(self, pin):
        # all units are in ns
        self.pin = PWM(pin, 50)                
        self.min = 0.68 # 5% duty cycle 5% of 20ms = 1ms
        self.max = 2.50 # 10% duty cycle 10% of 20ms = 2ms
        self.angle = 0

    def set_angle(self, angle):
        if angle < 0:
            angle = 0
        elif angle > 180:
            angle = 180
        self.angle = angle
        # print("angle: ", angle)
        target_duty_cycle = (angle / 180 * (self.max - self.min) + self.min)
        #print("target_duty_cycle: ", target_duty_cycle)    
        self.pin.duty_cycle_ms(target_duty_cycle)

    def get_angle(self):
        return self.angle

    def deinit(self):    
        self.pin.unexport()
