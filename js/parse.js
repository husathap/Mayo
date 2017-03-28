let parser = (function() {

  let customFuncs = {};

  function execute(line) {

    // Execute the function in the line.
    if (line.hasOwnProperty("exec")) {
      line.exec();

    // Define a new custom function.
    } else if (line.hasOwnProperty("def")) {
      customFuncs[line.def] = { lambda:line.lambda };

    // Alert
    } else if (line.hasOwnProperty("alert")) {
      alert(line.alert);

    // If statement
    } else if (line.hasOwnProperty("if")) {

      let res = line["if"]();
      exports.parse(line[res]);

    // Character
    } else if (line.hasOwnProperty("character")) {
      $("#gameboard").append("<div id='" + line.character + "' class='character'></div>");

      let char = $("#" + line.character);
      char.css({"position": "absolute", "left": line.x, "top": line.y, "width": line.width, "height": line.height, "background": line.background});
      char.click(function(e) {
        characterOrEnemyClicked = true;
        exports.parse(line.click);
      });

    // Naviation
    } else if (line.hasOwnProperty("navigate")) {
      $("#gameboard").append("<div id='" + line.navigate + "' class='navigate' data='" + line.path + "'></div>");

      let nav = $("#" + line.navigate);
      nav.css({"position": "absolute", "left": line.x, "top": line.y, "width": "30px", "height": "30px", "background": "green"});

    // Add a wall
    } else if (line.hasOwnProperty("wall")) {
      $("#gameboard").append("<div id='" + line.wall + "' class='wall'></div>");

      let wall = $("#" + line.wall);
      wall.css({"position": "absolute", "left": line.x, "top": line.y, "width": line.width, "height": line.height, "background": line.background});

    } else if (line.hasOwnProperty("enemy")) {
      $("#gameboard").append("<div id='" + line.enemy + "' class='enemy'></div>");

      let enemy = $("#" + line.enemy);
      enemy.data("hp", enemies[line.type].hp);
      enemy.data("power", enemies[line.type].power);
      enemy.css(enemies[line.type].css);
      enemy.css({"position": "absolute", "left": line.x, "top": line.y});
      enemy.data("update", enemies[line.type].update);
      enemy.click(function() {
        characterOrEnemyClicked = true;
        let newHp = $(this).data("hp") - 1;
        $(this).data("hp", newHp);
      });
      
      if (line.hasOwnProperty("deadJs"))
        enemy.data("deadJs", line.deadJs);
      if (line.hasOwnProperty("dead"))
        enemy.data("dead", line.dead);

    // Dialogue
    } else if (line.hasOwnProperty("dialogue")) {

      $("body").append("<div id='dialogue' style='position:absolute; width:100%; height:100%; top:0; left:0; overflow:hidden; background-color:rgba(255,0,0,0.5)'></div>");
      dialogue = line.dialogue;
      di = -1;
      exports.parseDialogue();

    // Executing a custom function.
    } else {
      let keys =  Object.keys(line)
      let customFuncKeys = Object.keys(customFuncs);

      let funcName = "";
      let params = [];

      for (let k = 0; k < keys.length; k++) {
        if (customFuncKeys.indexOf(keys[k]) >= 0) {
          funcName = keys[k];
        } else {
          params.push(keys[k]);
        }
      }

      for (let l = 0; l < customFuncs[funcName].lambda.length; l++) {
        let customFuncLine = customFuncs[funcName].lambda[l];
        console.log(customFuncLine)

        if (params.length > 0 && Object.keys(customFuncLine).indexOf("exec") == -1) {
          let stringCustomFuncLine = JSON.stringify(customFuncLine);

          for (let p = 0; p < params.length; p++) {
            stringCustomFuncLine = stringCustomFuncLine.replace(params[p], line[params[p]]);
          }

          customFuncLine = JSON.parse(stringCustomFuncLine);
        }

        execute(customFuncLine);
      }
    }
  }

  let exports = {};

  exports.parse = function(code) {
    for (let i = 0; i < code.length; i++) {
      execute(code[i]);
    }
  }

  // Dealing with Dialogue...

  let di = -1;
  let dialogue;

  // Check if the dialogue is on or not.
  exports.isDialogueOn = function() {
    return di > -1;
  }

  exports.parseDialogue = function() {
    // If a dialogue has never been parsed before, set it up!
    di++;

    if (di >= dialogue.length) {
      $("#dialogue").remove();
      di = -1;
      dialogue = [];
    } else {
      if (dialogue[di].hasOwnProperty("say")) {
        $("#dialogue").append("<div id='say' style='font-color:white; font-size:xx-large'>" + dialogue[di].say + "</div>")
          .click(function() {
            $("#say").remove();
            $("#dialogue").unbind("click");
            exports.parseDialogue();
          })
      } else if (dialogue[di].hasOwnProperty("label")) {
        // Don't do anything if it's a label!
        exports.parseDialogue();
      } else if (dialogue[di].hasOwnProperty("break")) {
        // End the dialog immediately.
        di = dialogue.length-1;
        exports.parseDialogue();
      } else if (dialogue[di].hasOwnProperty("select")) {
        // Making a decision in the dialog.
        let choices = dialogue[di].select;

        $("#dialogue").append("<select id='select'></select><button id='OK'>OK</button>")

        $.each(choices, function(i, v) {
          $("#select").append("<option>" + v + "</option>");
        });

        $("#OK").click(function() {
          let label = $("#select").val();

          for (let newDi = di; newDi < dialogue.length; newDi++) {
            if (dialogue[newDi].hasOwnProperty("label") && dialogue[newDi].label == label) {
              di = newDi;
              dialogue.splice(di+1, 0, {say: ""});
              $("#OK").remove();
              $("#select").remove();

              break;
            }
          }

          exports.parseDialogue();
        });
      } else if (dialogue[di].hasOwnProperty("goto")) {

        for (let i = 0; i < dialogue.length; i++) {
          if (dialogue[i].hasOwnProperty("label") && dialogue[i].label == dialogue[di].goto) {
            di = i;
            break;
          }
        }

        exports.parseDialogue();
      }
    }
  }

  return exports;
})();
