"use strict";

var _express = _interopRequireDefault(require("express"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
//arrow function
var configViewEngine = function configViewEngine(app) {
  // cấu hình những file mà client có thể truy cập, ở đây là những file trong thư mục public
  app.use(_express["default"]["static"]("./src/public"));
  //định nghĩ file logic trong html, sử dụng thư mục ejs
  app.set("view engine", "ejs");
  app.set("views", "./src/views");
};

// để các file JS khác có thể sử dụng function này thì phải export
module.exports = configViewEngine;