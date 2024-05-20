class v83x_ADC():
    def __init__(self, addr=b"0x05070080") -> None:
        self.addr = addr
        self.path = "/sys/class/sunxi_dump/dump"
        self.file = open(self.path, "wb+")
        self.last = self.value()
    def __del__(self):
        try:
            if self.file:
                self.file.close()
                del self.file
        except Exception as e:
            pass
    def value(self):
        self.file.write(b"0x05070080")
        self.file.seek(0)
        return int(self.file.read()[:-1], 16)
