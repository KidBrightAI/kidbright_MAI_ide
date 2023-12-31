
export default class struct {
    static lut = {
      "b": {u: DataView.prototype.getInt8, p: DataView.prototype.setInt8, bytes: 1},
      "B": {u: DataView.prototype.getUint8, p: DataView.prototype.setUint8, bytes: 1},
      "h": {u: DataView.prototype.getInt16, p: DataView.prototype.setInt16, bytes: 2},
      "H": {u: DataView.prototype.getUint16, p: DataView.prototype.setUint16, bytes: 2},
      "i": {u: DataView.prototype.getInt32, p: DataView.prototype.setInt32, bytes: 4},
      "I": {u: DataView.prototype.getUint32, p: DataView.prototype.setUint32, bytes: 4},
      "q": {u: DataView.prototype.getInt64, p: DataView.prototype.setInt64, bytes: 8},
      "Q": {u: DataView.prototype.getUint64, p: DataView.prototype.setUint64, bytes: 8},
    }

    static pack(...args) {
        let format = args[0];
        let pointer = 0;
        let data = args.slice(1);
        if (format.replace(/[<>]/, '').length != data.length) {
            throw("Pack format to Argument count mismatch");
            return;
        }
        let bytes = [];
        let littleEndian = true;
        for (let i = 0; i < format.length; i++) {
            if (format[i] == "<") {
                littleEndian = true;
            } else if (format[i] == ">") {
                littleEndian = false;
            } else {
                pushBytes(format[i], data[pointer]);
                pointer++;
            }
        }

        function pushBytes(formatChar, value) {
            if (!(formatChar in struct.lut)) {
                throw("Unhandled character '" + formatChar + "' in pack format");
            }
            let dataSize = struct.lut[formatChar].bytes;
            let view = new DataView(new ArrayBuffer(dataSize));
            let dataViewFn = struct.lut[formatChar].p.bind(view);
            dataViewFn(0, value, littleEndian);
            for (let i = 0; i < dataSize; i++) {
                bytes.push(view.getUint8(i));
            }
        }

        return bytes;
    };

    static unpack(format, bytes) {
        let pointer = 0;
        let data = [];
        let littleEndian = true;

        for (let c of format) {
            if (c == "<") {
                littleEndian = true;
            } else if (c == ">") {
                littleEndian = false;
            } else {
                pushData(c);
            }
        }

        function pushData(formatChar) {
            if (!(formatChar in struct.lut)) {
                throw("Unhandled character '" + formatChar + "' in unpack format");
            }
            let dataSize = struct.lut[formatChar].bytes;
            let view = new DataView(new ArrayBuffer(dataSize));
            for (let i = 0; i < dataSize; i++) {
              view.setUint8(i, bytes[pointer + i] & 0xFF);
            }
            let dataViewFn = struct.lut[formatChar].u.bind(view);
            data.push(dataViewFn(0, littleEndian));
            pointer += dataSize;
        }

        return data;
    };
}
