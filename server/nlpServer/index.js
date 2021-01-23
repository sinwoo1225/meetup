const express = require("express");
const app = express();
const port = 5000;
const { KMR, KKMA } = require("koalanlp/API");
const { initialize } = require("koalanlp/Util");
const { Tagger, Parser } = require("koalanlp/proc");
let is_initial = false;
let regular = "....../NNG";
app.use(express.json());

async function executor(req) {
	if (is_initial == false) {
		//중복 실행 시 오류 방지
		await initialize({
			packages: { KMR: "2.0.4", KKMA: "2.0.4" },
			verbose: true,
		});
		is_initial = true;
	}

	let parser = new Parser(KKMA);
	let parsetest = req;
	//정규화 이용해서 타임라인 및 콜론 제거
	parsetest = parsetest.replace(/:/gm, "");
	parsetest = parsetest.replace(/\[[0-9][0-9][0-9][0-9][0-9][0-9]\]/gm, "");
	let parsed = await parser(parsetest);
	var map = {}; //태그 추출 위한 해시맵
	for (const sent of parsed) {
		let index = 0;
		for (const dep of sent.dependencies) {
			//각 문장별 형태소 추출
			let len = dep.toString().length;
			console.log(dep.toString());
			while (true) {
				//NNG 형태소(단어) 추출하고 갯수 세는 알고리즘
				if (!dep.toString().substring(index, len).includes("/NNG") == true)
					break;
				let temp = dep
					.toString()
					.substring(index, len)
					.match(regular)[0]
					.substring(0, dep.toString().match(regular)[0].indexOf("/")); //temp 인덱스부터 /NNG전까지 문자열
				if (temp.indexOf(" ") + temp.indexOf("+") == -2)
					console.log("string length error!");
				//이하 /NNG와 결합된 단어 추출 temp에 덮어쓰기
				else if (temp.indexOf(" ") == -1)
					temp = temp.substring(temp.lastIndexOf("+") + 1, temp.length);
				else if (temp.indexOf("+") == -1)
					temp = temp.substring(temp.lastIndexOf(" ") + 1, temp.length);
				else
					temp =
						temp.lastIndexOf(" ") < temp.lastIndexOf("+")
							? temp.substring(temp.lastIndexOf(" ") + 1, temp.length)
							: temp.substring(temp.lastIndexOf("+") + 1, temp.length);
				//console.log(temp);
				if (map[temp] == null) map[temp] = 1;
				else map[temp] = map[temp] + 1;
				index = dep.toString().indexOf("/NNG", index) + 1;
			}
			index = 0;
		}
	}

	//가장 빈도가 높은 3개 단어 추출
	let keywords = ["", "", ""];
	for (var i = 0; i < 3; i++) {
		let max = 0;
		let index = "";
		for (var j in map) {
			if (map[j] > max) {
				max = map[j];
				index = j;
			}
		}
		keywords[i] = index;
		map[index] = 0;
	}
	return keywords;
}

app.post("/", (req, res) => {
	executor(req.body.script).then(
		(keywords) =>
			res.json({
				tags: keywords,
			}),
		(error) => console.error("Error Occurred!", error)
	);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
