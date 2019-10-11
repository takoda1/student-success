webpackHotUpdate("static/development/pages/index.js",{

/***/ "./shared.js":
/*!*******************!*\
  !*** ./shared.js ***!
  \*******************/
/*! exports provided: Layout, GoalList, Timer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Layout", function() { return Layout; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GoalList", function() { return GoalList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Timer", function() { return Timer; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
var _jsxFileName = "/Users/perry_000/Documents/School/F19/COMP523/student-success/shared.js";

var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;


var layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD'
};

var Layout = function Layout(props) {
  return __jsx("div", {
    style: layoutStyle,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 11
    },
    __self: this
  }, __jsx(NavBar, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12
    },
    __self: this
  }), props.children);
};

var linkStyle = {
  marginRight: 15
};

function NavBar() {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23
    },
    __self: this
  }, __jsx(Button, {
    name: "Home",
    path: "/index",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24
    },
    __self: this
  }), __jsx(Button, {
    name: "History",
    path: "/history",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25
    },
    __self: this
  }), __jsx(Button, {
    name: "Group",
    path: "/group",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26
    },
    __self: this
  }), __jsx(Button, {
    name: "Forum",
    path: "/forum",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 27
    },
    __self: this
  }));
}

function Button(props) {
  return __jsx(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
    href: props.path,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 34
    },
    __self: this
  }, __jsx("a", {
    style: linkStyle,
    title: props.name,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35
    },
    __self: this
  }, props.name));
}

function GoalList(props) {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42
    },
    __self: this
  }, __jsx("ul", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43
    },
    __self: this
  }, props.goals.map(function (g) {
    return __jsx(GoalItem, {
      key: g.content,
      goal: g,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 44
      },
      __self: this
    });
  })), __jsx(GoalsCompleted, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 46
    },
    __self: this
  }));
}

function GoalItem(props) {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53
    },
    __self: this
  }, __jsx("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54
    },
    __self: this
  }, __jsx("input", {
    type: "checkbox",
    value: props.goal.complete,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 55
    },
    __self: this
  }), props.goal.content, ' ', __jsx("button", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 58
    },
    __self: this
  }, "Edit")));
}

function GoalsCompleted(props) {
  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 66
    },
    __self: this
  }, __jsx("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 67
    },
    __self: this
  }, props.goals.reduce(function (memo, goal) {
    memo ? goal.complete : false;
  }, true)));
}

function Timer(props) {
  function startTimer() {
    console.log("start ".concat(props.name));
  }

  function stopTimer() {
    console.log("stop ".concat(props.name));
  }

  function resetTimer() {
    console.log("reset ".concat(props.name));
  }

  return __jsx("div", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86
    },
    __self: this
  }, __jsx("p", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87
    },
    __self: this
  }, props.name, ": ", "30:00", __jsx("button", {
    onClick: startTimer,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 89
    },
    __self: this
  }, "start"), __jsx("button", {
    onClick: stopTimer,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 90
    },
    __self: this
  }, "stop"), __jsx("button", {
    onClick: resetTimer,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 91
    },
    __self: this
  }, "reset")));
}

/***/ })

})
//# sourceMappingURL=index.js.d155e50a1987af9ce0c2.hot-update.js.map