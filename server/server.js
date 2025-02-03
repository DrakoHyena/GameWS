import * as logger from "./logger.js";
import * as ws from "ws"
import { Encoder, Decoder } from "./coder.js";
import { compressPacket, getOptimizations, getPacketId} from "./optimizer.js";

let wss = undefined;
function gameWs({
	port,
	connectionsPerIp,
	saveOptimizations
}) {
	wss = new ws.WebSocketServer({
		port: port
	})

	wss.on("connection", function (ws) {
		ws._send = ws.send;
		ws.send = function () {
			const args = Array.from(arguments);
			const name = args.shift()
			if (typeof name !== "string") throw new Error("Packet name must be a string, got: " + name);
			let encoder = new Encoder();

			const packetId = getPacketId(name);
			encoder.setFlagged(packetId); // Set packet id from name
			function encodeData(arr) { // Add the rest of our data, unpacking any arrays
				for (let i = 0; i < arr.length; i++) {
					if (typeof arr[i] === "object") {
						if (Array.isArray(arr[i])) {
							encodeData(arr[i]);
							continue;
						}
						throw new Error("Cannot encode objects other than arrays")
					}
					encoder.setFlagged(arr[i])
				}
			}
			encodeData(args);
			data = compressPacket(packetId, encoder.wsFinalize());

			ws._send(encoder.wsFinalize())
		}

		ws.send("optimizations", JSON.stringify(getOptimizations().packets))
		ws.send("version", 1)

		ws.on("message", function (data) {
			let decoder = new Decoder(data);
			let arr = [];
			while (decoder.bytesUsed !== data.byteLength) {
				arr.push(decoder.getFlagged())
			}
			// forward array to dev
		})
	})

	return wss;
}

process.on('SIGINT', () => {
	console.log(logger.getLog());
	process.exit(1);
});

export { gameWs, wss }
