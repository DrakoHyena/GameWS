import { WebSocket } from "ws"

export async function test (wss){
	return await new Promise((res, rej)=>{
		let ws = new WebSocket(`ws://127.0.0.1:${wss.address().port}`)
		ws.on("open", function(){
			res(true);
		})

		ws.on("error", function(err){
			rej(err)
		})
	})
}