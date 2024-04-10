export default {
    id: "kidbright-mai",
    name: "KidBright uAI",
    image: "images/board.png",
    //uploadMode: "REPL",
    version: "1.0.0",
    chip: "MaixII",
    firmware: [],
    usb: [
        {
            vendorId: 0x18d1,
            productId: 0x0002
        }
    ],
    blocks: [
        "blocks/blocks_basic.js",
        "blocks/blocks_camera.js",
        "blocks/blocks_display.js",
        "blocks/blocks_image.js",
        "blocks/blocks_gpio.js",
        "blocks/blocks_ai.js",
        "blocks/generators_basic.js",
        "blocks/generators_image.js",
        "blocks/generators_camera.js",
        "blocks/generators_display.js",
        "blocks/generators_gpio.js",
        "blocks/generators_ai.js",
    ],
    autoCompletion: {},
}
