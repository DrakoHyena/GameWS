import { Encoder, Decoder } from "../server/coder.js"
export async function test (wss){
	return await new Promise((res, rej)=>{
		let data = [null, undefined, NaN, Infinity, -Infinity, "asd", true, false, 255, 65535, 4294967295, 4294967296, -128, -32768, -2147483648, -2147483649, 1.1];
		let outputData = [];

		let encoder = new Encoder();
		data.forEach(d=>encoder.setFlagged(d));
		
		let decoder = new Decoder(encoder.varFinalize());
		while(decoder.bytesUsed < decoder.buffer.byteLength){
			outputData.push(decoder.getFlagged());
		}
		
		for(let i = 0; i < data.length; i++){
			if(Number.isNaN(data[i])){
				if(Number.isNaN(data[i]) !== Number.isNaN(outputData[i])){
					rej(new Error(`Starting data (${data[i]}) is not equal to the encoded->decoded data (${outputData[i]}). Index: ${i}`))
				}
				continue;
			}
			if(data[i] !== outputData[i]){
				rej(new Error(`Starting data (${data[i]}) is not equal to the encoded->decoded data (${outputData[i]}). Index: ${i}`))
			}
		}
		
		res(true);
	})
}