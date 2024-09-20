"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _userService = _interopRequireDefault(require("../services/userService"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var handleLogin = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var email, password, userData;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          // api để giao tiếp giưã server và server, nên khi ta gọi api thì 
          // nó sẽ trả ra dữ liệu dưới dạng json object chứ không render ra màn hình giao diện nào cả
          //bình thường khi trả lại thống báo thì sử dụng res.send hoặc res.render nhưng vì đây 
          //là api nên  sẽ sử dụng res.status để trả lại một đối tượng là trạng thái
          //số 200 dưới dâyd là mã lỗi, có nhiều kiểu mã lỗi như sau:
          //mã trạng thái 1xx: thông tin: yêu cầu được chấp nhận hoặc tiếp tục quá trính
          //mã trạng thái 2xx: thành công
          //mã trạng thái 3xx: chuyển hướng
          //mã trạng thái 4xx: lỗi từ client chỉ ra rằng yêu cầu không thể hoàn thành 
          //mã trạng thái 5xx: lỗi từ phía server
          email = req.body.email;
          password = req.body.password; // console.log(email);
          //check email người dùng gửi tới có tồn tại hay không
          if (!(!email || !password)) {
            _context.next = 4;
            break;
          }
          return _context.abrupt("return", res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
          }));
        case 4:
          _context.next = 6;
          return _userService["default"].handleUserLogin(email, password);
        case 6:
          userData = _context.sent;
          return _context.abrupt("return", res.status(200).json({
            // errCode: 0,
            // message: 'found that client in server',
            // yourEmail: email,
            // yourPassword: password,
            errCode: userData.errCode,
            message: userData.errMessage,
            //nếu file userService trả lại biến user thì lấy biến user còn không thì lấy biến rỗng 
            user: userData.user ? userData.user : {}
          }));
        case 8:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function handleLogin(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
var handleGetAllUsersForReact = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var id, users;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          id = req.query.id; //all || id
          //nếu truyền vào id là all thì lấy tất cả người dùng còn id thì lấy 1 
          if (id) {
            _context2.next = 3;
            break;
          }
          return _context2.abrupt("return", res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required parameters!',
            users: []
          }));
        case 3:
          _context2.next = 5;
          return _userService["default"].getAllUsersForReact(id);
        case 5:
          users = _context2.sent;
          return _context2.abrupt("return", res.status(200).json({
            errCode: 0,
            errMessage: 'Get user(s) from Database successfully',
            users: users
          }));
        case 7:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function handleGetAllUsersForReact(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();
var handleCreateNewUserInReact = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var message;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _userService["default"].createNewUserInReact(req.body);
        case 2:
          message = _context3.sent;
          console.log(message);
          return _context3.abrupt("return", res.status(200).json(message));
        case 5:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function handleCreateNewUserInReact(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();
var handleEditUserInReact = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var data, message;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          data = req.body;
          _context4.next = 3;
          return _userService["default"].editUserInReact(data);
        case 3:
          message = _context4.sent;
          return _context4.abrupt("return", res.status(200).json(message));
        case 5:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return function handleEditUserInReact(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();
var handleDeleteUserInReact = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var message;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          if (req.body.id) {
            _context5.next = 2;
            break;
          }
          return _context5.abrupt("return", res.status(200).json({
            errCode: 1,
            message: "Mising required parameters! Maybe need deleted user's id is missing"
          }));
        case 2:
          _context5.next = 4;
          return _userService["default"].deleteUserInReact(req.body.id);
        case 4:
          message = _context5.sent;
          return _context5.abrupt("return", res.status(200).json(message));
        case 6:
        case "end":
          return _context5.stop();
      }
    }, _callee5);
  }));
  return function handleDeleteUserInReact(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();
var getAllCodesData = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          //đây chỉ là ví dụ cho một trường hợp thực tế chứ cứ code không cần timeout cx đc
          // cần xét timeout tại vì trong thực tế không thể gọi api phát mà dữ liệu được lấy luôn được
          setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
            var data;
            return _regeneratorRuntime().wrap(function _callee6$(_context6) {
              while (1) switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return _userService["default"].getAllCodesDataService(req.query.type);
                case 2:
                  data = _context6.sent;
                  return _context6.abrupt("return", res.status(200).json(data));
                case 4:
                case "end":
                  return _context6.stop();
              }
            }, _callee6);
          })), 500);
          //khi load lại trang thì nó đợi 1.5s nó mới gọi api
          _context7.next = 8;
          break;
        case 4:
          _context7.prev = 4;
          _context7.t0 = _context7["catch"](0);
          console.log("Get AllCodes's data error: ", _context7.t0);
          return _context7.abrupt("return", res.status(200).json({
            errCode: -1,
            errMessage: "Error of getting AllCodes's data from server"
          }));
        case 8:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[0, 4]]);
  }));
  return function getAllCodesData(_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}();
var getAllRelativeInforsOfCurrentSystemUser = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
            var data;
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.next = 2;
                  return _userService["default"].getAllRelativeInforsOfCurrentSystemUserService(req.query.email);
                case 2:
                  data = _context8.sent;
                  return _context8.abrupt("return", res.status(200).json(data));
                case 4:
                case "end":
                  return _context8.stop();
              }
            }, _callee8);
          })), 500);
          _context9.next = 8;
          break;
        case 4:
          _context9.prev = 4;
          _context9.t0 = _context9["catch"](0);
          console.log("Get all relative infors of current system's user: ", _context9.t0);
          return _context9.abrupt("return", res.status(200).json({
            errCode: -1,
            errMessage: "Get all relative infors of current system's user error from server!"
          }));
        case 8:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[0, 4]]);
  }));
  return function getAllRelativeInforsOfCurrentSystemUser(_x13, _x14) {
    return _ref8.apply(this, arguments);
  };
}();
module.exports = {
  handleLogin: handleLogin,
  handleGetAllUsersForReact: handleGetAllUsersForReact,
  handleCreateNewUserInReact: handleCreateNewUserInReact,
  handleEditUserInReact: handleEditUserInReact,
  handleDeleteUserInReact: handleDeleteUserInReact,
  getAllCodesData: getAllCodesData,
  getAllRelativeInforsOfCurrentSystemUser: getAllRelativeInforsOfCurrentSystemUser
};