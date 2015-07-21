var svg, expr;
var numx = /(\d+)x/g,
  xnum = /x(\d+)/g,
  bracket2 = /\)\(/g
bracketnum = /\)(\d+)/g,
  numbracket = /(\d+)\(/g,
  xbracket = /x\(/g,
  bracketx = /\)x/g,
  pow = /(x|\d|\(.*\))\^(\d)/g;
// h = ステップ幅　x = 現在のx  nextx = 前のx convergence = 収束幅
var h, x, convergence = 5,
  differential, differentialdash, X, Xdash;
var output, ansbuf;
var temp;
var delete_log = function() {
  var aNode = document.getElementById("answer");
  for (var i = aNode.childNodes.length - 1; i >= 0; i--) {
    aNode.removeChild(aNode.childNodes[i]);
  }
}
var log = function(str) {
  ansbuf = document.createElement('text');
  ansbuf.textContent = str;
  output.appendChild(ansbuf);
  output.appendChild(document.createElement('br'));
};
var start_plot = function() {
  svg = document.getElementById('svggraph');
  expr = document.getElementById('expr').value;
  var plot = svg.commands("plot");
  var clear = svg.commands("clear");
  plot(expr);
};
var clear_plot = function() {
  svg = document.getElementById('svggraph');
  var minx = document.getElementById('minx'),
    maxx = document.getElementById('maxx'),
    miny = document.getElementById('miny'),
    maxy = document.getElementById('maxy'),
    intx = document.getElementById('intx'),
    inty = document.getElementById('inty'),
    color = document.getElementById('color');
  var clear = svg.commands("clear");
  clear();
  svg.macros("drawAxis")(minx.value, maxx.value, miny.value, maxy.value, intx.value, inty.value, color.value);
};

var change_color = function() {
  var svg = document.getElementById('svggraph');
  var color = document.getElementById('color');
  svg.macros("change_color")(color.value);
};
var dot_plot = function(x, y) {
  var dot = svg.commands("dot");
  var text = svg.commands("text");
  // if(typeof dot_plot.count === 'undefined'){
  //   dot_plot.count = 0;
  // }
  dot_plot.count++;
  dot(x, y, 'dot');
  log('dot_plot count : ' + dot_plot.count + '  point :' + x + ' , ' + y);
  text(x, y, dot_plot.count, 'bottom');
};

var calculate = function(e, local_x) {
  //数式に数字を代入する前の前処理
  e = e.replace(numx, "$1*x");
  e = e.replace(xnum, "$1*x");
  e = e.replace(bracket2, ")*(");
  e = e.replace(bracketnum, ")*$1");
  e = e.replace(numbracket, "$1*(");
  e = e.replace(xbracket, "x*(");
  e = e.replace(bracketx, ")*x");
  e = e.replace(pow, "Math.pow($1,$2)");
  //  console.log(e);
  e = e.replace(/x/g, local_x);
  // var ans = eval("3-2");
  return eval(e);
};

// 勾配法(上り)関数
var gradient = function() {
  //init
  dot_plot.count = 0;
  convergence = document.getElementById('convergence').value;
  output = document.getElementById('answer');
  //f'(x)を取得
  differential = document.getElementById('differential').value;
  h = parseFloat(document.getElementById('step').value);
  var X, Xdash;
  // step 1

  x = document.getElementById('first').value;
  // step 2
  while (Math.abs(calculate(differential, x)) > convergence) {
    log('f\'(x) :' + calculate(differential, x));
    if (dot_plot.count > 100) {
      alert('失敗。そろそろやめときます。');
      break;
    }
    h = Math.abs(h) * Math.sign(calculate(differential, x));
    X = x;
    Xdash = parseFloat(x) + h;
    //step 3
    if (calculate(expr, X) < calculate(expr, Xdash)) {
      // (a)
      while (calculate(expr, X) < calculate(expr, Xdash)) {
        log('step3 (a) h:' + h);
        log('step3 (a) X: ' + X + ' , ' + calculate(expr, X));
        log('step3 (a) X\':' + Xdash + ' , ' + calculate(expr, Xdash));
        //dot_plot(X, calculate(expr, X));
        h = 2 * h;
        X = Xdash;
        Xdash = X + h;
      }
      log('step3 (a) h:' + h);
      log('step3 (a) X: ' + X + ' , ' + calculate(expr, X));
      log('step3 (a) X\':' + Xdash + ' , ' + calculate(expr, Xdash));
      //(b)
      x = X;
      h = h / 2;
    }
    //step 4
    else {
      // (a)
      while (calculate(expr, X) >= calculate(expr, Xdash)) {
        log('step4 (a) h :' + h);
        log('step4 (a) X: ' + X + ' , ' + calculate(expr, X));
        log('step4 (a) X\':' + Xdash + ' , ' + calculate(expr, Xdash));
        //dot_plot(Xdash, calculate(expr, Xdash));
        h = h / 2;
        Xdash = Xdash - h;
      }
      log('step4 (a) h :' + h);
      log('step4 (a) X: ' + X + ' , ' + calculate(expr, X));
      log('step4 (a) X\':' + Xdash + ' , ' + calculate(expr, Xdash));
      // (b)
      x = Xdash;
      h = 2 * h;
    }
    dot_plot(x, calculate(expr, x));
    log('h :' + h);
    log('----------------------------------');
  }
  alert('x = ' + x + ' , y = ' + calculate(expr, x));
}

var newton = function() {
  dot_plot.count = 0;
  //init
  var plot = document.getElementById('svggraph').commands('plot');
  convergence = document.getElementById('convergence').value;
  expr = document.getElementById('expr').value;
  differential = document.getElementById('differential').value;
  differentialdash = document.getElementById('differentialdash').value;
  output = document.getElementById('answer');
  x = document.getElementById('first').value;
  while (true) {
    X = x;
    x = X - (calculate(differential, X) / calculate(differentialdash, X));
    log('newton x:' + x);
    dot_plot(x, calculate(expr, x));
    plot(calculate(expr,X) + ' + ' + calculate(differential,X)+ '(x -' + X + ')' + '+' + calculate(differentialdash,X)/2 + '(x -' + X + ')^2' );
    log(calculate(expr,X) + ' + ' + calculate(differential,X)+ '(x -' + X + ')' + '+' + calculate(differentialdash,X)/2 + '(x -' + X + ')^2');
    log('--------------------------------');

    if (Math.abs(X - x) < convergence) {
      break;
    }
    if(dot_plot.count > 100){
      alert('失敗?');
      break;
    }
  }
  alert('x = ' + x + ', y = ' + calculate(expr, x));
}
