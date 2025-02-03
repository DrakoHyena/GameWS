import { Decoder, Encoder } from "./coder.js";

// TODO: replace with optimizations.packet.packetname.dataCaches

const mainCache = new Map();
const cacheAgeLimit = 30_000
function accessCache(cache){
	cache.lastAccessed = Date.now();
	for(let [k, v] of cache){
		if(v.lastAccessed && Date.now() - v.lastAccessed > cacheAgeLimit){
			cache.delete(k);
		}
	}
	return cache;
}

const cacheIds = {}
cacheIds.nextId = 0;

function compressPacket(packetId, buffer, cache, index=0, outputEncoder=new Encoder(), walkedPrevious=false, previous=undefined){
	if(index === 0){
		outputEncoder.setFlagged(packetId);
		index = outputEncoder.bytesUsed;
	}

	// We reached the end of our inital data
	if(buffer[index] === undefined){
		if(index === outputEncoder.bytesUsed){ // empty packet
			return buffer;
		}

		if(cache.cacheId === undefined){
			cache.cacheId = cacheIds.nextId++;
			cacheIds[cache.cacheId] = Buffer.copyBytesFrom(buffer, 0, index);
		}
		
		// TODO: Update optimizations for everyone
		outputEncoder.setDataCache(cache.cacheId);
		return outputEncoder.wsFinalize();
	};

	// access cache
	accessCache(cache);

	// cache hit
//

	// cache walk
	if(cache.has(buffer[index])){
		return compressPacket(packetId, buffer, cache.get(buffer[index]), ++index, outputEncoder, true, previous=cache);
	}
	// cache miss
	if(walkedPrevious === true){ // if last cache hit sub it in then look for next cache
		previous.cacheId = cacheIds.nextId++;
		cacheIds[previous.cacheId] = Buffer.copyBytesFrom(buffer, 0, index);
		outputEncoder.setDataCache(previous.cacheId);
		return compressPacket(packetId, buffer, mainCache, ++index, outputEncoder, false, previous=mainCache)
	}
	// Last cache missed, grow the branch
	let newBranch = new Map();
	cache.set(buffer[index], newBranch);
	return compressPacket(packetId, buffer, newBranch, ++index, outputEncoder, false, previous=cache);
}

let sum = 0;
for(let i = 0; i < 5; i++){
	let encoder = new Encoder();
	encoder.setFlagged(0); // packet id
	encoder.setUint8(1);
	encoder.setUint8(3);
	encoder.setUint8(5);
	encoder.setUint8(i);
	encoder.setUint8(1);
	encoder.setUint8(3);
	encoder.setUint8(5);
	let buf = encoder.wsFinalize();
	let start = performance.now();
	console.log(compressPacket(0, buf, mainCache));
	let time = performance.now()-start;
	sum += time;
	console.log(time)
}
console.log(sum, cacheIds, mainCache.get(1).get(3))