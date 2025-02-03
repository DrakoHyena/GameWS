const stats = {}
let log = ""

function warn(name, entry){
	let text = `[${process.uptime()}][${name}][WARNING] ${entry}\n`;
	log += text
	console.warn(text);
}

function addLog(name, logEntry){
	log += `[${process.uptime()}][${name}] ${logEntry}\n`
}

function getLog(){
	return log
}

function updateStat(category, stat, value){
	if(!stats[category]) stats[category] = {}
	stats[category][stat] = value
}

function getStats(){
	return `STATISTICS:\n${JSON.stringify(stats, null, "| ")}`
}

export {updateStat, getStats, addLog, getLog, warn}