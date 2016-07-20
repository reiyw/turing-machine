// Statesクラスのようなもの
function States() {
    this.stateNames = [];
}
// states.状態名.nextState[i]
// states.状態名.readSymbol[i]
// states.状態名.writeSymbol[i]
// states.状態名.direction directionだけは状態に固有の値
States.prototype.push = function (addingState, nextState, readSymbol, writeSymbol, direction) {
    if (this.stateNames.indexOf(addingState) == -1) {
        this.stateNames.push(addingState);
        eval("states." + addingState + " = new Object();");
        eval("states." + addingState + ".nextState = [];");
        eval("states." + addingState + ".readSymbol = [];");
        eval("states." + addingState + ".writeSymbol = [];");
        eval("states." + addingState + ".nextState.push(\"" + nextState + "\");");
        eval("states." + addingState + ".readSymbol.push(\"" + readSymbol + "\");");
        eval("states." + addingState + ".writeSymbol.push(\"" + writeSymbol + "\");");
        eval("states." + addingState + ".direction = \"" + direction + "\";");
    } else {
        eval("states." + addingState + ".nextState.push(\"" + nextState + "\");");
        eval("states." + addingState + ".readSymbol.push(\"" + readSymbol + "\");");
        eval("states." + addingState + ".writeSymbol.push(\"" + writeSymbol + "\");");
    }
}


function initialize() {
    tape = [];
    states = new States();
    currentState = "";
    $(".result").text("");
    $("tr").remove();
}


function readFile() {
    var fileObj = $("#input").prop("files")[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var TMDescription = reader.result;
        var rows = TMDescription.split(/\r\n|\r|\n/);
        var units;
        for (var i = 0; i < rows.length; i++) {
            units = rows[i].split(/\,/);
            /****************************
             **********  注意  **********
             ****************************/
            if (units.length == 5) {
                if (states.stateNames.length == 0) {
                    currentState = units[0]; // 一番最初に取得した状態を開始状態とする
                }
                states.push(units[0], units[1], units[2], units[3], units[4]);
            }
        }
        states.push("reject", "-", "-", "-", "-");
        states.push("accept", "-", "-", "-", "-");

        // ファイル読み込みが並列で行われてるらしく，
        // 読み込みが終わる前に処理がどんどん進んでしまってバグの原因になっていた．
        // 本当はmainに上手いこと書くべきなのだろうが，
        // 思いつかないのでとりあえずはここに置いておく．
        readTape();
        runTuringMachine();
    };
    reader.readAsText(fileObj, "UTF-8");
}


function readTape() {
    var tapeDescription = $("#tape").val();
    tape = tapeDescription.split(/\,/);
    for (var i = 0; i < tape.length; i++) {
        if (tape[i] == " ") {
            tape[i] = "_";
        }
    }
}


function appendCurrentTapeToTable(transitionCount, headIndex) {
    $("tbody").append("<tr></tr>");
    $("tr:last").append("<th>" + transitionCount + "(" + currentState + ")</th>");
    for (var i = 0; i < tape.length; i++) {
        $("tr:last").append("<td>" + tape[i] + "</td>");
        if (i == headIndex) {
            $("td:last").attr("id", "head");
        }
    }
}


function runTuringMachine() {
    var maximumTransitionCount = $("input[name=max]").val();
    var j = 0, headIndex = 0, isTapeExtended = false;
    eval("var obj = states." + currentState + ";");
    for (var i = 0; i < maximumTransitionCount; i++) {
        if (currentState == "accept") {
            $(".result").text("受理");
            break;
        } else if (currentState == "reject") {
            $(".result").text("非受理");
            break;
        }

        if (obj.direction == "R") {
            Outer:
            for (headIndex++;; headIndex++) {
                if (headIndex >= tape.length) {
                    if (isTapeExtended) {
                        alert("テープの内容を確認して下さい．");
                        return;
                    }
                    tape[headIndex] = "_"; // 右側はスペース
                    isTapeExtended = true;
                }
                for (j = 0; j < obj.readSymbol.length; j++) {
                    if (tape[headIndex] == obj.readSymbol[j]) {
                        isTapeExtended = false;
                        break Outer;
                    }
                }
            }
        } else if (obj.direction == "L") {
            Outer:
            for (headIndex--;; headIndex--) {
                for (j = 0; j < obj.readSymbol.length; j++) {
                    if (tape[headIndex] == obj.readSymbol[j]) {
                        break Outer;
                    }
                }
            }
        } else {
            for (j = 0; j < obj.readSymbol.length; j++) {
                if (tape[headIndex] == obj.readSymbol[j]) {
                    break;
                }
            }
        }

        appendCurrentTapeToTable(i + 1, headIndex);

        tape[headIndex] = obj.writeSymbol[j];
        eval("currentState = states." + currentState + ".nextState[" + j + "];");
        eval("obj = states." + currentState + ";");
    }

    appendCurrentTapeToTable(i + 1, headIndex);
    $("tbody").prepend("<tr><th></th></tr>");
    for (var i = 0; i < tape.length; i++) {
        $("tr:first").append("<th>" + (i + 1) + "</th>");
    }
}


$(function() {
    $("#run").click(function() {
        initialize();
        readFile();
    });
})
