import * as logger from "./logger.js";
import { getDataType, idToDataType, dataTypeToId } from "./dataTypes.js"; 

let encoderBuffer = Buffer.allocUnsafe(1);
let encoderInUse = false;
class Encoder {
	constructor() {
		this.bytesUsed = 0;
		this.buffer = encoderBuffer;
		if(encoderInUse === true){
			throw new Error("Can only use one encoder at a time")
		}
		encoderInUse = true;
	}
	_ensureSpace(length){
		if(encoderBuffer.byteLength < (this.bytesUsed+length)){
			const newBuff = Buffer.allocUnsafe(this.bytesUsed+length);
			encoderBuffer.copy(newBuff, 0, 0, encoderBuffer.length);
			this.buffer = encoderBuffer = newBuff
			logger.updateStat("Coder", "Buffer Size", encoderBuffer.byteLength);
			logger.addLog("Coder", `Updated encoderbuffer size to ${newBuff.byteLength}`)
		}
	}
	setInt8(value) {
		this._ensureSpace(1);
		this.buffer.writeInt8(value, this.bytesUsed);
		this.bytesUsed += 1;
	}
	setUint8(value) {
		this._ensureSpace(1);
		this.buffer.writeUint8(value, this.bytesUsed);
		this.bytesUsed += 1;
	}
	setInt16(value) {
		this._ensureSpace(2);
		this.buffer.writeInt16BE(value, this.bytesUsed);
		this.bytesUsed += 2;
	}
	setUint16(value) {
		this._ensureSpace(2);
		this.buffer.writeUint16BE(value, this.bytesUsed);
		this.bytesUsed += 2;
	}
	setInt32(value) {
		this._ensureSpace(4);
		this.buffer.writeInt32BE(value, this.bytesUsed);
		this.bytesUsed += 4;
	}
	setUint32(value) {
		this._ensureSpace(4);
		this.buffer.writeUint32BE(value, this.bytesUsed);
		this.bytesUsed += 4;
	}
	setFloat32(value) {
		this._ensureSpace(4);
		this.buffer.writeFloatBE(value, this.bytesUsed);
		this.bytesUsed += 4;
	}
	setFloat64(value) {
		this._ensureSpace(8);
		this.buffer.writeDoubleBE(value, this.bytesUsed);
		this.bytesUsed += 8;
	}
	setBigInt64(value) {
		this._ensureSpace(8);
		this.buffer.writeBigInt64BE(BigInt(value), this.bytesUsed);
		this.bytesUsed += 8;
	}
	setBigUint64(value) {
		this._ensureSpace(8);
		this.buffer.writeBigUint64BE(BigInt(value), this.bytesUsed);
		this.bytesUsed += 8;
	}
	setString(value) {
		const str = encodeURI(value);
		this._ensureSpace(str.length+1);
		for (let i = 0; i < str.length; i++) {
			this.setUint8(str.charCodeAt(i));
		}
		this.setUint8(0);
	}
	setNaN(value) {
		this._ensureSpace(1);
		this.setUint8(0);
	}
	setNull(value) {
		this._ensureSpace(1);
		this.setUint8(0);
	}
	setUndefined(value){
		this._ensureSpace(1);
		this.setUint8(0);
	}
	setInfinity(value){
		this._ensureSpace(1);
		this.setInt8(Math.sign(value))
	}
	setBoolean(value){
		if(value){
			this.setUint8(0)
		}else{
			this.setUint8(1)
		}
	}
	setDataCache(value){
		this.setUint8(0); // Data Cache flag
		this.setFlagged(value); // Data Cache Id
	}
	setFlagged(value){
		const dataType = getDataType(value);
		this.setUint8(dataTypeToId[dataType]);
		this[`set${dataType}`](value);
	}
	wsFinalize() {
		if(this.disposed === true){
			throw new Error("Cannot finalize on a disposed Encoder")
		}
		encoderInUse = false;
		return this.buffer.subarray(0, this.bytesUsed);
	}
	varFinalize() {
		if(this.disposed === true){
			throw new Error("Cannot finalize on a disposed Encoder")
		}
		encoderInUse = false;
		return Buffer.copyBytesFrom(this.buffer, 0, this.bytesUsed);
	}
	dispose(){
		encoderInUse = false;
		this.disposed = true;
	}
}
class Decoder {
	constructor(buffer) {
		this.bytesUsed = 0;
		this.buffer = Buffer.from(buffer);
	}
	getInt8() {
		this.bytesUsed += 1;
		return this.buffer.readInt8(this.bytesUsed - 1);
	}
	getUint8() {
		this.bytesUsed += 1;
		return this.buffer.readUint8(this.bytesUsed - 1);
	}
	getInt16() {
		this.bytesUsed += 2;
		return this.buffer.readInt16BE(this.bytesUsed - 2);
	}
	getUint16() {
		this.bytesUsed += 2;
		return this.buffer.readUint16BE(this.bytesUsed - 2);
	}
	getInt32() {
		this.bytesUsed += 4;
		return this.buffer.readInt32BE(this.bytesUsed - 4);
	}
	getUint32() {
		this.bytesUsed += 4;
		return this.buffer.readUint32BE(this.bytesUsed - 4);
	}
	getFloat32() {
		this.bytesUsed += 4;
		return this.buffer.readFloatBE(this.bytesUsed - 4);
	}
	getFloat64() {
		this.bytesUsed += 8;
		return this.buffer.readDoubleBE(this.bytesUsed - 8);
	}
	getBigInt64() {
		this.bytesUsed += 8;
		return Number(this.buffer.readBigInt64BE(this.bytesUsed - 8));
	}
	getBigUint64() {
		this.bytesUsed += 8;
		return Number(this.buffer.readBigUint64BE(this.bytesUsed - 8));
	}
	getString() {
		let str = "";
		let uInt8 = this.getUint8();
		while (uInt8 !== 0) {
			str += String.fromCharCode(uInt8);
			uInt8 = this.getUint8();
		}
		return decodeURI(str);
	}
	getNaN() {
		this.getUint8();
		return NaN;
	}
	getNull() {
		this.getUint8();
		return null
	}
	getUndefined(){
		this.getUint8();
		return undefined
	}
	getInfinity(){
		return Infinity*this.getInt8();
	}
	getBoolean(){
		return this.getUint8() === 0
	}
	getFlagged(){
		return this[`get${idToDataType[this.getUint8()]}`]();
	}
}

export {Encoder, Decoder}