var curProg;
var curSub;
var curI;

function compile(prog) {
  curProg = jsyaml.load(prog);
  curSub = "main";
  curI = 0;
  $("#screen").click(function() {advance()});
  advance();
}

function advance() {
  if (curI < curProg[curSub].length) {
    parseLine(curProg[curSub][curI]);
    curI++;
  }
}

function formatString(array) {
  var ret = array[0];

  for (var i = 1; i < array.length; i++) {
    var word = (array[i][0] == "$") ? sessionStorage.getItem(array[i].substring(1)) : array[i];
    ret = ret.replace("_", word);
  }

  return ret;
}

function parseLine(line) {
  var com = Object.keys(line)[0];
  var arg = line[com];

  switch (com) {
    // Set the width of the screen.
    case "width":
      $("#screen").css("width", arg);
      break;

    // Set the height of the screen.
    case "height":
      $("#screen").css("height", arg);
      break;

    // Add HTML/Text to the screen.
    case "add":
      if (Array.isArray(arg)) {
        $("#screen").append(formatString(arg));
      } else {
        $("#screen").append(arg);
      }
      break;

    // Replace HTML content
    case "replace":
      if (Array.isArray(arg)) {
        $(arg[0]).html(Array.isArray(arg[1]) ? formatString(arg[1]) : arg[1]);
      } else {
        $(arg["target"]).html(Array.isArray(arg["content"]) ? formatString(arg["content"]) : arg["content"]);
      }
      break;

    // Set a new variable
    case "var":
      if (Array.isArray(arg)) {
        sessionStorage.setItem(arg[0], arg[1]);
      } else {
        sessionStorage.setItem(arg["name"], arg["value"]);
      }
      break;

    // Comparing cases
    case "case":

      function _adv(sub) {
        return function() {
          curI = 0;
          curSub = sub;
          advance();
        };
      }

      for (var i = 0; i < arg.length; i++) {
        var cond = arg[i][0].split(" ");
        var sub = arg[i][1];

        // Check for default.
        if (cond.length == 1) {
          _adv(sub)();
          break;
        }

        // If the case is not default, proceed.

        var var1 = (cond[0][0] == "$") ? sessionStorage.getItem(cond[0].substring(1)) : cond[0];
        var var2 = (cond[2][0] == "$") ? sessionStorage.getItem(cond[2].substring(1)) : cond[2];

        // Normal comparison.
        if (cond[1] == "==" && var1 == var2) {_adv(sub)(); break; }
        else if (cond[1] == "!=" && var1 != var2) {_adv(sub)(); break; }
        else if (cond[1] == "<" && var1 < var2) {_adv(sub)(); break; }
        else if (cond[1] == "<=" && var1 <= var2) {_adv(sub)(); break; }
        else if (cond[1] == ">" && var1 > var2) {_adv(sub)(); break; }
        else if (cond[1] == ">=" && var1 >= var2) {_adv(sub)(); break; }

        // Numerical comparison.
        else if (cond[1] == "#==" && Number(var1) == Number(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "#!=" && Number(var1) != Number(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "#<" && Number(var1) < Number(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "#<=" && Number(var1) <= Number(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "#>" && Number(var1) > Number(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "#>=" && Number(var1) >= Number(var2)) {_adv(sub)(); break; }

        // String comparison.
        else if (cond[1] == "$==" && String(var1) == String(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "$!=" && String(var1) != String(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "$<" && String(var1) < String(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "$<=" && String(var1) <= String(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "$>" && String(var1) > String(var2)) {_adv(sub)(); break; }
        else if (cond[1] == "$>=" && String(var1) >= String(var2)) {_adv(sub)(); break; }
      }
      break;

    // Remove certain element.
    case "remove":
      $(arg).remove();
      break;

    // Alter the background.
    case "background":
      $("#screen").css("background", arg);
      break;

    // Pop up confirm.
    case "confirm":
      var r = confirm(arg["question"]);

      if (r) {
        curSub = arg["yes"];
      } else {
        curSub = arg["no"];
      }

      curI = 0;
      advance();
      curI = 0;

      break;

    case "choices":

      var b = {};

      for (var i = 0; i < arg["answers"].length; i++) {
        b[i] = { label: arg["answers"][i][0], callback: (function(i) {
          return function() {
            curI = 0;
            curSub = arg["answers"][i][1];
            bootbox.hideAll();
            advance();
          }
        })(i)};
      }

      bootbox.dialog({
        message: arg["question"],
        closeButton: false,
        buttons: b
      });

      break;

    // Execute multiple lines at once.
    case "block":
      for (var i = 0; i < arg.length; i++) {
        parseLine(arg[i]);
      }
      break;

    // Other case.
    default:

      // Invoke an existing function.
      if (com in curProg) {
        curSub = com;
        curI = 0;
        advance();
        curI = 0;
      } else {
      // Unknown function.
        alert(com);
      }
      break;
  }
}
