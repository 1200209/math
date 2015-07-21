(function(){
  // int は interval
  SVGGraph.registerMacro("drawAxis",function(minx,maxx,miny,maxy,intx,inty,color){
    setRange(minx,maxx,miny,maxy);
    axis('full', intx, inty, 0, 0);
    style.stroke=color;
    style.strokeWidth='1';
  });
  SVGGraph.registerMacro("change_color",function(color){
      style.stroke=color;
  })
})();
