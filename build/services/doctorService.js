"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _ejs = require("ejs");
var _index = _interopRequireDefault(require("../models/index"));
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _lodash = _interopRequireDefault(require("lodash"));
var _moment = _interopRequireDefault(require("moment"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
require('dotenv').config();
var MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR = process.env.MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR;
var getEliteDoctorForHomePage = function getEliteDoctorForHomePage(limitEliteDoctor) {
  return new Promise(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(resolve, reject) {
      var doctors;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _index["default"].User.findAll({
              limit: limitEliteDoctor,
              where: {
                roleId: 'R2'
              },
              order: [['createdAt', 'DESC']],
              attributes: {
                exclude: ['password']
              },
              include: [{
                model: _index["default"].Allcode,
                as: 'positionData',
                attributes: ['value_Eng', 'value_Vie']
              }, {
                model: _index["default"].Allcode,
                as: 'genderData',
                attributes: ['value_Eng', 'value_Vie']
              }],
              raw: true,
              nest: true
            });
          case 3:
            doctors = _context.sent;
            resolve({
              errCode: 0,
              data: doctors
            });
            _context.next = 10;
            break;
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            reject(_context.t0);
          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 7]]);
    }));
    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};
var getAllDoctorsForDoctorArticlePage = function getAllDoctorsForDoctorArticlePage() {
  return new Promise(/*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(resolve, reject) {
      var doctors;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _index["default"].User.findAll({
              where: {
                roleId: 'R2'
              },
              attributes: {
                exclude: ['password', 'image']
              }
            });
          case 3:
            doctors = _context2.sent;
            resolve({
              errCode: 0,
              data: doctors
            });
            _context2.next = 10;
            break;
          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            reject(_context2.t0);
          case 10:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[0, 7]]);
    }));
    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
};
var checkRequiredField = function checkRequiredField(inputData) {
  var arrFields = ['doctorId', 'htmlContent', 'markdownContent', 'action', 'selectedPrice', 'selectedPaymentMethod', 'selectedProvince', 'clinicName', 'clinicAddress', 'note', 'specialtyId'];
  var isValid = true;
  var element = '';
  for (var i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element
  };
};
var saveInforAndArticleOfADoctorService = function saveInforAndArticleOfADoctorService(inputData) {
  return new Promise(/*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(resolve, reject) {
      var checkObj, needEdittingDoctorArticle, doctorInfor;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            checkObj = checkRequiredField(inputData);
            if (!(checkObj.isValid === false)) {
              _context3.next = 6;
              break;
            }
            resolve({
              errCode: 1,
              errMesage: 'Missing parameters!'
            });
            _context3.next = 41;
            break;
          case 6:
            if (!(inputData.action === 'CREATE')) {
              _context3.next = 11;
              break;
            }
            _context3.next = 9;
            return _index["default"].ArticleMarkdown.create({
              htmlContent: inputData.htmlContent,
              markdownContent: inputData.markdownContent,
              description: inputData.description,
              doctorId: inputData.doctorId
            });
          case 9:
            _context3.next = 21;
            break;
          case 11:
            if (!(inputData.action === 'EDIT')) {
              _context3.next = 21;
              break;
            }
            _context3.next = 14;
            return _index["default"].ArticleMarkdown.findOne({
              where: {
                doctorId: inputData.doctorId
              },
              raw: false
            });
          case 14:
            needEdittingDoctorArticle = _context3.sent;
            if (!needEdittingDoctorArticle) {
              _context3.next = 21;
              break;
            }
            needEdittingDoctorArticle.htmlContent = inputData.htmlContent;
            needEdittingDoctorArticle.markdownContent = inputData.markdownContent;
            needEdittingDoctorArticle.description = inputData.description;
            _context3.next = 21;
            return needEdittingDoctorArticle.save();
          case 21:
            _context3.next = 23;
            return _index["default"].Doctor_infor.findOne({
              where: {
                doctorId: inputData.doctorId
              },
              raw: false
            });
          case 23:
            doctorInfor = _context3.sent;
            if (!doctorInfor) {
              _context3.next = 38;
              break;
            }
            //update
            doctorInfor.doctorId = inputData.doctorId;
            doctorInfor.priceId = inputData.selectedPrice;
            doctorInfor.provinceId = inputData.selectedProvince;
            doctorInfor.paymentId = inputData.selectedPaymentMethod;
            doctorInfor.clinicAddress = inputData.clinicAddress;
            doctorInfor.clinicName = inputData.clinicName;
            doctorInfor.note = inputData.note;
            doctorInfor.specialtyId = inputData.specialtyId;
            doctorInfor.clinicId = inputData.clinicId;
            _context3.next = 36;
            return doctorInfor.save();
          case 36:
            _context3.next = 40;
            break;
          case 38:
            _context3.next = 40;
            return _index["default"].Doctor_infor.create({
              doctorId: inputData.doctorId,
              priceId: inputData.selectedPrice,
              provinceId: inputData.selectedProvince,
              paymentId: inputData.selectedPaymentMethod,
              clinicAddress: inputData.clinicAddress,
              clinicName: inputData.clinicName,
              note: inputData.note,
              specialtyId: inputData.specialtyId,
              clinicId: inputData.clinicId
            });
          case 40:
            resolve({
              errCode: 0,
              errMessage: 'Save article for doctor successfully!'
            });
          case 41:
            _context3.next = 46;
            break;
          case 43:
            _context3.prev = 43;
            _context3.t0 = _context3["catch"](0);
            reject(_context3.t0);
          case 46:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[0, 43]]);
    }));
    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
};
var getParticularInforForDoctorPage = function getParticularInforForDoctorPage(inputDoctorId) {
  return new Promise(/*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee4(resolve, reject) {
      var data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            if (inputDoctorId) {
              _context4.next = 5;
              break;
            }
            resolve({
              errCode: 1,
              errMessage: "Missing required parameter(s)!"
            });
            _context4.next = 11;
            break;
          case 5:
            _context4.next = 7;
            return _index["default"].User.findOne({
              where: {
                id: inputDoctorId
              },
              attributes: {
                exclude: ['password']
              },
              include: [{
                model: _index["default"].ArticleMarkdown,
                attributes: ['htmlContent', 'markdownContent', 'description']
              }, {
                model: _index["default"].Allcode,
                as: 'positionData',
                attributes: ['value_Eng', 'value_Vie']
              }, {
                model: _index["default"].Doctor_infor,
                attributes: {
                  exclude: ['id', 'doctorId']
                },
                include: [{
                  model: _index["default"].Allcode,
                  as: 'priceTypeData',
                  attributes: ['value_Eng', 'value_Vie']
                }, {
                  model: _index["default"].Allcode,
                  as: 'provinceTypeData',
                  attributes: ['value_Eng', 'value_Vie']
                }, {
                  model: _index["default"].Allcode,
                  as: 'paymentTypeData',
                  attributes: ['value_Eng', 'value_Vie']
                }, {
                  model: _index["default"].Specialty,
                  as: 'belongToSpecialty',
                  attributes: ['name']
                }]
              }],
              raw: false,
              nest: true
            });
          case 7:
            data = _context4.sent;
            if (data && data.image) {
              data.image = Buffer.from(data.image, 'base64').toString('binary');
            }
            if (!data) data = {};
            resolve({
              errCode: 0,
              data: data
            });
          case 11:
            _context4.next = 16;
            break;
          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](0);
            reject(_context4.t0);
          case 16:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[0, 13]]);
    }));
    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }());
};
var bulkCreateTimeframesForDoctorService = function bulkCreateTimeframesForDoctorService(inputData) {
  return new Promise(/*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee5(resolve, reject) {
      var availableTimeframe, existing, needAdding;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            if (!(!inputData.scheduleArr || !inputData.doctorId || !inputData.formatedDate)) {
              _context5.next = 5;
              break;
            }
            resolve({
              errCode: 1,
              errMessage: 'Missing required parameters: timeframe data!'
            });
            _context5.next = 16;
            break;
          case 5:
            availableTimeframe = inputData.scheduleArr;
            if (availableTimeframe && availableTimeframe.length > 0) {
              availableTimeframe.map(function (item) {
                item.maxNumber = MAX_NUMBER_CAN_RENDEZVOUS_DOCTOR;
                return item;
              });
            }

            //kiểm tra timeframe của một bác sĩ đã tồn tại
            _context5.next = 9;
            return _index["default"].Schedule.findAll({
              where: {
                doctorId: inputData.doctorId,
                date: inputData.formatedDate
              },
              attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
              raw: true
            });
          case 9:
            existing = _context5.sent;
            if (existing && existing.length > 0) {
              existing = existing.map(function (item) {
                item.date = new Date(item.date).getTime();
                return item;
              });
            }

            //compare to find differences
            needAdding = _lodash["default"].differenceWith(availableTimeframe, existing, function (a, b) {
              return a.timeType === b.timeType && a.date === b.date;
            }); //create
            if (!(needAdding && needAdding.length > 0)) {
              _context5.next = 15;
              break;
            }
            _context5.next = 15;
            return _index["default"].Schedule.bulkCreate(needAdding);
          case 15:
            // console.log('Timeframe for doctor: ', availableTimeframe);
            // await db.Schedule.bulkCreate(availableTimeframe);
            resolve({
              errCode: 0,
              errMessage: 'Create available time for doctor appointment successfully!'
            });
          case 16:
            _context5.next = 21;
            break;
          case 18:
            _context5.prev = 18;
            _context5.t0 = _context5["catch"](0);
            reject(_context5.t0);
          case 21:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 18]]);
    }));
    return function (_x9, _x10) {
      return _ref5.apply(this, arguments);
    };
  }());
};
var getScheduleByDateService = function getScheduleByDateService(doctorId, date) {
  return new Promise(/*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee6(resolve, reject) {
      var formattedDate, scheduleData;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;
            if (!(!doctorId || !date)) {
              _context6.next = 5;
              break;
            }
            resolve({
              errCode: 1,
              errMessage: 'Missing required parameter: doctorId or date!'
            });
            _context6.next = 11;
            break;
          case 5:
            formattedDate = (0, _moment["default"])(Number(date)).format('YYYY-MM-DD 00:00:00');
            _context6.next = 8;
            return _index["default"].Schedule.findAll({
              where: {
                doctorId: doctorId,
                date: formattedDate
              },
              include: [{
                model: _index["default"].Allcode,
                as: 'timeTypeData',
                attributes: ['value_Eng', 'value_Vie']
              }],
              raw: false,
              nest: true
            });
          case 8:
            scheduleData = _context6.sent;
            if (!scheduleData) {
              scheduleData = ["no schedule"];
            }
            resolve({
              errCode: 0,
              errMessage: "Get doctor schedule successfully!",
              data: scheduleData
            });
          case 11:
            _context6.next = 15;
            break;
          case 13:
            _context6.prev = 13;
            _context6.t0 = _context6["catch"](0);
          case 15:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[0, 13]]);
    }));
    return function (_x11, _x12) {
      return _ref6.apply(this, arguments);
    };
  }());
};
var getExtraInforDoctorByIDService = function getExtraInforDoctorByIDService(inputId) {
  return new Promise(/*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee7(resolve, reject) {
      var data;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            if (inputId) {
              _context7.next = 5;
              break;
            }
            resolve({
              errCode: 1,
              errMessage: 'Missing input parameter: doctorId'
            });
            _context7.next = 10;
            break;
          case 5:
            _context7.next = 7;
            return _index["default"].Doctor_infor.findOne({
              where: {
                doctorId: inputId
              },
              attributes: {
                exclude: ['id', 'doctorId']
              },
              include: [{
                model: _index["default"].Allcode,
                as: 'priceTypeData',
                attributes: ['value_Eng', 'value_Vie']
              }, {
                model: _index["default"].Allcode,
                as: 'provinceTypeData',
                attributes: ['value_Eng', 'value_Vie']
              }, {
                model: _index["default"].Allcode,
                as: 'paymentTypeData',
                attributes: ['value_Eng', 'value_Vie']
              }],
              raw: false,
              nest: true
            });
          case 7:
            data = _context7.sent;
            if (!data) {
              data = {};
            }
            resolve({
              errCode: 0,
              data: data
            });
          case 10:
            _context7.next = 15;
            break;
          case 12:
            _context7.prev = 12;
            _context7.t0 = _context7["catch"](0);
            reject(_context7.t0);
          case 15:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[0, 12]]);
    }));
    return function (_x13, _x14) {
      return _ref7.apply(this, arguments);
    };
  }());
};
module.exports = {
  getEliteDoctorForHomePage: getEliteDoctorForHomePage,
  getAllDoctorsForDoctorArticlePage: getAllDoctorsForDoctorArticlePage,
  saveInforAndArticleOfADoctorService: saveInforAndArticleOfADoctorService,
  getParticularInforForDoctorPage: getParticularInforForDoctorPage,
  bulkCreateTimeframesForDoctorService: bulkCreateTimeframesForDoctorService,
  getScheduleByDateService: getScheduleByDateService,
  getExtraInforDoctorByIDService: getExtraInforDoctorByIDService
};