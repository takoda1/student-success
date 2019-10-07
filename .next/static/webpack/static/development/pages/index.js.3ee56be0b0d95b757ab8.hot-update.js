webpackHotUpdate("static/development/pages/index.js",{

/***/ "./pages/index.js":
/*!************************!*\
  !*** ./pages/index.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _shared__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared */ "./shared.js");
var _jsxFileName = "/Users/perry_000/Documents/School/F19/COMP523/student-success/pages/index.js";

var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;



var Index = function Index() {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 5
    },
    __self: this
  }, __jsx(_shared__WEBPACK_IMPORTED_MODULE_2__["NavBar"], {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    },
    __self: this
  }), __jsx("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7
    },
    __self: this
  }, "Hello Next.js"));
};

/* harmony default export */ __webpack_exports__["default"] = (Index);

/***/ }),

/***/ "./shared.js":
/*!*******************!*\
  !*** ./shared.js ***!
  \*******************/
/*! exports provided: NavBar, Button */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NavBar", function() { return NavBar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Button", function() { return Button; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _jsxFileName = "/Users/perry_000/Documents/School/F19/COMP523/student-success/shared.js";

var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;


function NavBar(props) {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 5
    },
    __self: this
  }, __jsx(Button, {
    name: "Home",
    path: "/index",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 6
    },
    __self: this
  }), __jsx(Button, {
    name: "History",
    path: "/history",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7
    },
    __self: this
  }), __jsx(Button, {
    name: "Group",
    path: "/group",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 8
    },
    __self: this
  }), __jsx(Button, {
    name: "Forum",
    path: "/forum",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9
    },
    __self: this
  }));
}

function Button(props) {
  return __jsx(Link, {
    href: props.path,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16
    },
    __self: this
  }, __jsx("a", {
    title: props.name,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17
    },
    __self: this
  }, props.name));
}

/***/ })

})
//# sourceMappingURL=index.js.3ee56be0b0d95b757ab8.hot-update.js.map