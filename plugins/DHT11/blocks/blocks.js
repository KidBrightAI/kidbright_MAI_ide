Blockly.defineBlocksWithJsonArray([
    {
      "type": "dht11_sensor",
      "message0": "DHT11 pin %1 read %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "pin",
          "options": [
            [
              "14",
              "PH14"
            ],
            [
              "13",
              "PH13"
            ]
          ]
        },
        {
          "type": "field_dropdown",
          "name": "type",
          "options": [
            [
              "temperature (°C)",
              "0"
            ],
            [
              "humidity (%RH)",
              "1"
            ]
          ]
        }
      ],
      "output": "Number",
      "colour": "#8b507c",
      "tooltip": "",
      "helpUrl": ""
    }
    ]);
    