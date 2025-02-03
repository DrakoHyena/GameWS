/*
This is a fully kitted server client.
Browser clients will look much different due to different apis.
Please see the tests in the client directory if you are looking for the browser version.
*/

import { WebSocket } from "ws"
import { Decoder } from "../server/coder.js"

export async function test (wss){
	return await new Promise((res, rej)=>{
		let ws = new WebSocket(`ws://127.0.0.1:${wss.address().port}`)
		let optimizations = undefined;

		ws.on("open", function(){
			res(true);
		})

		ws.on("error", function(err){
			rej(err)
		})

		ws.on("message", function(data){
			let decoder = new Decoder(data);

			if(optimizations === undefined){
				decoder.getFlagged();
				optimizations = JSON.parse(decoder.getFlagged())
				console.log(optimizations)
				return;
			}

		})
	
	})
}