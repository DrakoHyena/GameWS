import * as logger from "./logger.js";
import * as fs from "node:fs";
import { Encoder } from "./coder.js";

const DEFAULT = {
	packets: {},
}

let optimizations = DEFAULT;
if(fs.existsSync("./server/ws-optimizations.json")){
	try{
		logger.addLog("Optimizer", "Using existing optimization file...")
		optimizations = JSON.parse(fs.readFileSync("./server/ws-optimizations.json", "utf8"))||DEFAULT
	}catch(err){
		optimizations = DEFAULT;
		logger.warn("Optimizer", `Error reading ./server/ws-optimizations.json`, err)
	}
}
optimizations["NOTE"] = "This file is auto generated to preserve optimizations between runs as to reduce performance impact. To disable this feature set saveOptimizations to false."

function _updateOptimizationFile(){
	fs.writeFile("./server/ws-optimizations.json", JSON.stringify(optimizations), (err)=>{
		if(err){
			logger.warn("Failed to write optimization file", err);
		}
	})
}

function getOptimizations(){
	return optimizations;
}

function writeOptimizations(optimizationsObject){
	if(typeof optimizationsObject !== "object") throw new Error("Can only write optimization objects. Got: "+optimizationsObject);
	optimizations = optimizationsObject;
	_updateOptimizationFile();
}

optimizations.packets.nextId = 0
function getPacketId(name){
	if(optimizations.packets[name]) return optimizations.packets[name].packetId;
	optimizations.packets[name] = {};
	optimizations.packets[name].packetId = optimizations.packets.nextId++;
	logger.addLog("Optimizer", `Added new packet type "${name}" with id ${optimizations.packets[name].packetId}`);
	_updateOptimizationFile();
	return optimizations.packets[name].packetId;
}


function compressPacket(buffer){

}

export { getOptimizations, writeOptimizations, getPacketId, compressPacket}