export default {
    id: "kidbright-mai",
    name: "KidBright uAI",
    image: "images/board.png",
    //uploadMode: "REPL",
    version: "1.0.0",
    chip: "MaixII",
    firmware: [
        {
            name: "Micropython ESP32_GENERIC",
            path: "firmware/ESP32_GENERIC-20230426-v1.20.0.bin",
            version: "v1.20.0",
            date: "2023-04-26",
            board: "EasyKids Robot Kit",
            cpu: "ESP32"
        },        
    ],
    usb: [
        {
            vendorId: 0x18d1,
            productId: 0x0002
        }
    ],
    blocks: [
        "blocks/blocks_display.js",
        "blocks/blocks_pin.js",
        "blocks/generators_display.js",
        "blocks/generators_pin.js",
    ],
    autoCompletion: {},
}
