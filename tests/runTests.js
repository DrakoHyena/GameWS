import * as fs from "node:fs";
import { gameWs } from "../server/server.js";
import { start } from "node:repl";
import { getLog } from "../server/logger.js";

const testDir = fs.readdirSync("./tests");
let testAmount = testDir.length;
let testsDone = 0;
let passedTests = 0;
let failedTests = 0;
let resultsLog = `
NODE VERSION: ${process.version}
WEBSOCKET LIBRARY: ${(()=>{let obj = JSON.parse(fs.readFileSync("./package.json", "utf8")).dependencies; let key = Object.keys(obj)[0]; return `${key} ${obj[key]}`})()}
TESTS:
`

let nextPort = 8003;
for(let file of testDir){
	if(file === "runTests.js" || file === "test-results"){
		testAmount -= 1;
		continue;
	};
	console.log(`Running test: ${file}`)
	import(`./${file}`).then(async ({test})=>{
		let websocketServer = gameWs({port: nextPort++})
		let results = undefined;
		let passed = false;
		try{
			results = await test(websocketServer)
			if(results === undefined) throw new Error("Test returned undefined");
			passed = true
			passedTests++;
		}catch(err){
			results = err.stack;
			failedTests++;
		}
		websocketServer.clients.forEach(client=>client.close())
		websocketServer.close();
		resultsLog += `[${passed?"✔":"✖"} ${file}] ${results}\n`

		testsDone++;
		if(testsDone === testAmount){
			outputResults();
		}
	});
	if(testsDone === testAmount){
		outputResults();
	}
}

function outputResults(){
	resultsLog += `RESULTS: ${failedTests>0?"✖ Failed":"✔ Passed"} (${passedTests}/${testAmount} tests passed)`
	resultsLog += "\n"
	console.log(resultsLog)
	fs.writeFileSync("./tests/test-results", resultsLog)
	console.log("(Wrote test results to ./tests/test-results)")
}