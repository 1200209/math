//copy by www2u.biglobe.ne.jp/~yuichi/rest/expand.html

function Expression_add(a){
  var i, j;

  for (i = 0; i < a.terms.length; i++) {
    for (j = 0; j < this.terms.length; j++) {
      if (this.terms[j].isVarEqual(a.terms[i])) {
        this.terms[j].add(a.terms[i]);
        break;
      }
    }
    if (j == this.terms.length) {	// 項がなければ追加する
      this.terms[j] = new Term(a.terms[i].toString());
    }
  }
  this.optimize();
}

// 引く
function Expression_sub(a){
  var i, j;

  for (i = 0; i < a.terms.length; i++) {
    for (j = 0; j < this.terms.length; j++) {
      if (this.terms[j].isVarEqual(a.terms[i])) {
        this.terms[j].sub(a.terms[i]);
        break;
      }
    }
    if (j == this.terms.length) {	// 項がなければ追加する
      this.terms[j] = new Term(a.terms[i].toString());
      this.terms[j].coeff *= -1;
    }
  }
  this.optimize();
}

// 掛ける
function Expression_times(a){
  var i, j, t;
  var n = new Expression("0");

  if (this.terms.length != 0 && a.terms.length != 0) {
    for (i = 0; i < a.terms.length; i++) {
      for (j = 0; j < this.terms.length; j++) {
        t = new Term(this.terms[j].toString());
        t.times(a.terms[i]);
        n.add(new Expression(t.toString()));
      }
    }
  }
  n.optimize();
  this.terms = n.terms;
}

// n乗する
function Expression_exp(n){
  var a;

  if (n == 0) {
    this.terms.length = 1;
    this.terms[0] = new Term("1");
  } else {
    a = new Expression(this.toString());
    while (n > 1) {
      this.times(a);
      n--;
    }
  }
}

// 最適化する
function Expression_optimize(){
  // 0の項を取り除く
  for (i = 0; i < this.terms.length; i++) {
    if (this.terms[i].coeff == 0) {
      this.terms = this.terms.slice(0, i).concat(this.terms.slice(i + 1, this.terms.length));
      i--;
    }
  }
  // 並べ替える
  this.terms.sort(Term_sortCallBack);
}

function Expression_toString(){
  var str = this.terms.join(" + ").replace(/\+ \-/g, "- ");
  return (str != "") ? str : "0";
}

// 式クラス
function Expression(str){
  var t = str.replace(/ /g, "").replace(/(.)\-/g, "$1+-").split("+");

  this.add = Expression_add;
  this.sub = Expression_sub;
  this.times = Expression_times;
  this.exp = Expression_exp;
  this.optimize = Expression_optimize;
  this.toString = Expression_toString;
  this.terms = new Array();
  if (t.length > 0) {
    for (var i = 0; i < t.length; i++) this.terms[i] = new Term(t[i]);
  } else {
    this.terms.length = 0;
  }
}

function isVariableName(name){
  return (name >= "x");
}

function Term_sortCallBack(a, b){
  var a_NameIndex, b_NameIndex;

  if (b.variables.length == 0) return -1;		// bが数字なのでaが先
  if (a.variables.length == 0) return 1;		// aが数字なのでbが先
  a_NameIndex = a.getFirstVariableIndex();
  b_NameIndex = b.getFirstVariableIndex();
  if (a_NameIndex != -1 || b_NameIndex != -1) {
    if (a_NameIndex == -1) return 1;	// aが定数,bが変数なのでbが先
    if (b_NameIndex == -1) return -1;	// aが変数,bが定数なのでaが先
    // 以下a,bどちらも変数
    do {
      if (a.variables[a_NameIndex].name < b.variables[b_NameIndex].name) return -1;
      if (a.variables[a_NameIndex].name > b.variables[b_NameIndex].name) return 1;
      if (a.variables[a_NameIndex].dim != b.variables[b_NameIndex].dim) {	// 次数の大きい方が先
        return b.variables[b_NameIndex].dim - a.variables[a_NameIndex].dim;
      }
      a_NameIndex++; b_NameIndex++;
    } while (a_NameIndex < a.variables.length && b_NameIndex < b.variables.length);
    if (a_NameIndex < a.variables.length) return -1;	// 変数が多いaが先
    if (b_NameIndex < b.variables.length) return 1;		// 変数が多いbが先
    // 変数部はa,b共に等しい
  }
  a_NameIndex = b_NameIndex = 0;
  do {
    if (a.variables[a_NameIndex].name < b.variables[b_NameIndex].name) return -1;
    if (a.variables[a_NameIndex].name > b.variables[b_NameIndex].name) return 1;
    if (a.variables[a_NameIndex].dim != b.variables[b_NameIndex].dim) {	// 次数の大きい方が先
      return b.variables[b_NameIndex].dim - a.variables[a_NameIndex].dim;
    }
    a_NameIndex++; b_NameIndex++;
  } while (a_NameIndex < a.variables.length && b_NameIndex < b.variables.length);
  if (a_NameIndex < a.variables.length) return -1;	// 変数が多いaが先
  if (b_NameIndex < b.variables.length) return 1;		// 変数が多いbが先
  return 0;		// ここまで来るのか？
}

// 変数が等しければtrueを返す
function Term_isVarEqual(a){
  if (a.variables.length != this.variables.length) return false;
  for (var i = 0; i < this.variables.length; i++) {
    if (!a.variables[i].isEqual(this.variables[i])) return false;
  }
  return true;
}

// 係数を加える
function Term_add(a){
  this.coeff += a.coeff;
}

// 係数を引く
function Term_sub(a){
  this.coeff -= a.coeff;
}

// 掛ける
function Term_times(a){
  var i;

  this.coeff *= a.coeff;
  for (i = 0; i < a.variables.length; i++) {
    for (j = 0; j < this.variables.length; j++) {
      if (this.variables[j].name == a.variables[i].name) {
        this.variables[j].dim += a.variables[i].dim;
        break;
      }
    }
    if (j == this.variables.length) {	// 同じ名前の変数が見つからなかったら追加
      this.variables[j] = new Variable(a.variables[i].toString());
    }
  }
  // 次数が0のものは取り除く
  for (i = 0; i < this.variables.length; i++) {
    if (this.variables[i].dim == 0) {
      this.variables = this.variables.slice(0, i).concat(this.variables.slice(i + 1, this.variables.length));
      i--;
    }
  }
  this.variables.sort();
}

// 項の変数の最初のインデックスを返す(-1だと変数がない)
function Term_getFirstVariableIndex(){
  for (i = 0; i < this.variables.length; i++) {
    if (isVariableName(this.variables[i].name)) return i;
  }
  return -1;
}

function Term_toString(){
  var str = "";

  if (this.variables.length == 0) {
    str = this.coeff.toString();
  } else if (this.coeff == -1) {
    str = "-";
  } else if (this.coeff != 1) {
    str = this.coeff.toString();
  }
  return str + this.variables.join("");
}

// 項クラス
function Term(str){
  var v;

  this.variables = new Array();		// 変数文字列
  if (str == "") {
    this.coeff = 0;
    v = null;
  } else {
    str.match(/^(\-?\d*)/);
    if (RegExp.$1 == "") {		// 係数
      this.coeff = 1;		// 明記されていなければ1
    } else if (RegExp.$1 == "-") {
      this.coeff = -1;	// マイナスだけなら-1
    } else {
      this.coeff = parseInt(RegExp.$1);
    }
    v = str.substring(RegExp.$1.length).match(/[a-z]\d*/g);
  }
  if (v) {
    for (var i = 0; i < v.length; i++) this.variables[i] = new Variable(v[i]);
  } else {
    this.variables.length = 0;
  }
  this.variables.sort();
  this.isVarEqual = Term_isVarEqual;
  this.add = Term_add;
  this.sub = Term_sub;
  this.times = Term_times;
  this.getFirstVariableIndex = Term_getFirstVariableIndex;
  this.toString = Term_toString;
}

// 変数名と次数が等しければtrueを返す
function Variable_isEqual(a){
  return (a.name == this.name && a.dim == this.dim);
}

function Variable_toString(){
  var str = this.name;

  if (this.dim != 1) str += this.dim;
  return str;
}

// 変数クラス
function Variable(str){
  if (!str.match(/^([a-z])(\d*)$/)) {
    alert("変数はアルファベット１文字でなければいけません - " + str);
    return null;
  }
  this.name = RegExp.$1;		// 変数文字列
  if (RegExp.$2 == "") {		// 次数
    this.dim = 1;		// 明記されていなければ次数は1
  } else {
    this.dim = parseInt(RegExp.$2);
  }
  this.isEqual = Variable_isEqual;
  this.toString = Variable_toString;
}

/********** 計算 **********/
function calc(){
  var strHTML;

  document.forms[0].ans.value = "";
  exp = document.forms[0].exp.value.toLowerCase();
  exp = exp.replace(/ /g, "");		// スペースを消す
  if (!exp.match(/^[a-z\d\(\)\+\- ]+$/)		// 指定の文字以外が入っていたり
      || exp.match(/[\+\-][\+\-]/)	// 記号が連続していたり
      || exp.match(/[\+\-\(]$/)) {	// 末尾が記号で終わっていたら
    error();	// 構文エラー
    return;
  }
  strHTML = exp.replace(/([a-z\)])(\d+)/g, "$1<SUP>$2<\/SUP>");
  exp = "(" + exp + ")";		// 括弧でくくる
  exp = exp.replace(/\(\-/g, "(0-");
  exp = nestExp().toString();
  exp= exp.replace(/x(\d)/g,"x^$1");
  document.forms[0].ans.value = exp;
  strHTML += " = " + exp.replace(/ /g, "").replace(/([a-z\)])(\d+)/g, "$1<SUP>$2<\/SUP>")
  if (document.all) {
    document.all.view.innerHTML = strHTML;
  } else if (document.getElementById) {
    if (document.getElementById("view").innerHTML) document.getElementById("view").innerHTML = strHTML;
  }
  document.forms[0].exp.focus();
}

function nestExp(){
  return nestAddSub();
}

/********** 加減算 **********/
function nestAddSub(){
  var a;

  a = nestTimes();
  while (exp != "") {
    switch (exp.charAt(0)) {
      case "+":
        exp = exp.substring(1);		// "+"を消す
        a.add(nestTimes());
        break;
      case "-":
        exp = exp.substring(1);		// "-"を消す
        a.sub(nestTimes());
        break;
      case ")":
        return a;
      default:
        error();
        return new Expression("0");
    }
  }
  return a;
}

/********** 乗算 **********/
function nestTimes(){
  var a = new Expression("1"), b;

  while (exp != "") {
    if (exp.charAt(0) == "(") {
      exp = exp.substring(1);
      b = nestExp();
      if (exp.charAt(0) != ")") {
        error();
        return new Expression("0");
      }
      exp = exp.substring(1);		// ")"を消す
      if (exp.match(/^(\d+)/)) {	// n乗
        exp = exp.substring(RegExp.$1.length);
        b.exp(parseInt(RegExp.$1, 10));
      }
    } else if (exp.match(/^([a-z0-9]+)/)) {
      exp = exp.substring(RegExp.$1.length);
      b = new Expression(RegExp.$1);
    } else {
      break;
    }
    a.times(b);
  }
  return a;
}

/********** エラー **********/
function error(){
  exp = "";
  if (document.all) document.all.view.innerHTML = "";
  alert("式が間違っています。");
  document.forms[0].exp.focus();
}
//-->
