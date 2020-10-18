'use strict';

var executor = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
    var parser, parsetest, parsed, map, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, sent, index, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, dep, len, temp, keywords, i, max, j;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(is_initial == false)) {
              _context.next = 4;
              break;
            }

            _context.next = 3;
            return initialize({ packages: { KMR: '2.0.4', KKMA: '2.0.4' }, verbose: true });

          case 3:
            is_initial = true;

          case 4:
            parser = new Parser(KKMA);
            parsetest = req;
            //정규화 이용해서 타임라인 및 콜론 제거

            parsetest = parsetest.replace(/:/gm, '');
            parsetest = parsetest.replace(/\[[0-9][0-9][0-9][0-9][0-9][0-9]\]/gm, '');
            _context.next = 10;
            return parser(parsetest);

          case 10:
            parsed = _context.sent;
            map = {}; //태그 추출 위한 해시맵

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 15;
            _iterator = parsed[Symbol.iterator]();

          case 17:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 59;
              break;
            }

            sent = _step.value;
            index = 0;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 23;
            _iterator2 = sent.dependencies[Symbol.iterator]();

          case 25:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 42;
              break;
            }

            dep = _step2.value;
            //각 문장별 형태소 추출
            len = dep.toString().length;

            console.log(dep.toString());

          case 29:
            if (!true) {
              _context.next = 38;
              break;
            }

            if (!(!dep.toString().substring(index, len).includes('/NNG') == true)) {
              _context.next = 32;
              break;
            }

            return _context.abrupt('break', 38);

          case 32:
            temp = dep.toString().substring(index, len).match(regular)[0].substring(0, dep.toString().match(regular)[0].indexOf('/')); //temp 인덱스부터 /NNG전까지 문자열

            if (temp.indexOf(' ') + temp.indexOf('+') == -2) console.log("string length error!"); //이하 /NNG와 결합된 단어 추출 temp에 덮어쓰기
            else if (temp.indexOf(' ') == -1) temp = temp.substring(temp.lastIndexOf('+') + 1, temp.length);else if (temp.indexOf('+') == -1) temp = temp.substring(temp.lastIndexOf(' ') + 1, temp.length);else temp = temp.lastIndexOf(' ') < temp.lastIndexOf('+') ? temp.substring(temp.lastIndexOf(' ') + 1, temp.length) : temp.substring(temp.lastIndexOf('+') + 1, temp.length);
            //console.log(temp);
            if (map[temp] == null) map[temp] = 1;else map[temp] = map[temp] + 1;
            index = dep.toString().indexOf("/NNG", index) + 1;
            _context.next = 29;
            break;

          case 38:
            index = 0;

          case 39:
            _iteratorNormalCompletion2 = true;
            _context.next = 25;
            break;

          case 42:
            _context.next = 48;
            break;

          case 44:
            _context.prev = 44;
            _context.t0 = _context['catch'](23);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t0;

          case 48:
            _context.prev = 48;
            _context.prev = 49;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 51:
            _context.prev = 51;

            if (!_didIteratorError2) {
              _context.next = 54;
              break;
            }

            throw _iteratorError2;

          case 54:
            return _context.finish(51);

          case 55:
            return _context.finish(48);

          case 56:
            _iteratorNormalCompletion = true;
            _context.next = 17;
            break;

          case 59:
            _context.next = 65;
            break;

          case 61:
            _context.prev = 61;
            _context.t1 = _context['catch'](15);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 65:
            _context.prev = 65;
            _context.prev = 66;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 68:
            _context.prev = 68;

            if (!_didIteratorError) {
              _context.next = 71;
              break;
            }

            throw _iteratorError;

          case 71:
            return _context.finish(68);

          case 72:
            return _context.finish(65);

          case 73:
            console.log(map);
            //가장 빈도가 높은 3개 단어 추출
            keywords = ['', '', ''];

            for (i = 0; i < 3; i++) {
              max = 0;
              index = '';

              for (j in map) {
                if (map[j] > max) {
                  max = map[j];
                  index = j;
                }
              }
              keywords[i] = index;
              map[index] = 0;
              console.log(i + 1 + " : " + keywords[i]);
            }
            return _context.abrupt('return', keywords);

          case 77:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[15, 61, 65, 73], [23, 44, 48, 56], [49,, 51, 55], [66,, 68, 72]]);
  }));

  return function executor(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var app = express();
var port = 3000;

var _require = require('koalanlp/API'),
    KMR = _require.KMR,
    KKMA = _require.KKMA;

var _require2 = require('koalanlp/Util'),
    initialize = _require2.initialize;

var _require3 = require('koalanlp/proc'),
    Tagger = _require3.Tagger,
    Parser = _require3.Parser;

var is_initial = false;
var regular = "....../NNG";
app.use(express.json());

app.post('/', function (req, res) {
  executor(req.body.script).then(function (keywords) {
    return res.json({
      "tags": keywords
    });
  }, function (error) {
    return console.error('Error Occurred!', error);
  });
});

app.listen(port, function () {
  console.log('Example app listening at http://localhost:' + port);
});