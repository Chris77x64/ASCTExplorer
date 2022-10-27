 /*
 Credits to:
 https://vega.github.io/vega/docs/expressions/#string-functions
 https://vega.github.io/vega/docs/transforms/linkpath/
 https://developer.mozilla.org/de/docs/Web/SVG/Tutorial/Paths
 https://vega.github.io/vega/examples/zoomable-scatter-plot/
 */
export const defaultSpecification =
    {
        "$schema": "https://vega.github.io/schema/vega/v5.json",
        "description": "Graph Drawing",
        "padding": { "top": 25, "left": 0,"right": 0,"bottom": 0},
        "autosize": "none", //{type: 'fit-x',resize:true},
        "signals": [
          // {
          //   "name": "width",
          //   "on": [ {
          //     "events": 'wheel!',
          //     "update": {"signal": "invert('xscale', width)"} //{"signal": "width+100"}//{"signal": "width+scale('xscale',width)"}
          //   } ] },

          // {
          //   "name": "height",
          //   "on": [ {
          //     "events": { "source": "window", "type": "resize" },
          //     "update": {"signal": "scale('yscale',height)"}
          //   } ] },
            {
                "name": "shape", "value": "line"
            },
            { "name": "xrange", "update": "[0, width]" },
           { "name": "yrange", "update": "[ 0,height]" },
            {
                "name": "down", "value": null,
                "on": [
                    {"events": "touchend", "update": "null"},
                    {"events": "mousedown, touchstart", "update": "xy()"}
                ]
            },
            {
                "name": "hover",
                "on": [
                    {"events": "*:mouseover", "encode": "hover"},
                    {"events": "*:mouseout",  "encode": "leave"},
                    {"events": "*:mousedown", "encode": "select"},
                    {"events": "*:mouseup",   "encode": "release"}
                ]
            },
            {
                "name": "xoffset",
                "update": "-(width + padding.bottom)"
            },
            {
                "name": "yoffset",
                "update": "-(height + padding.left)"
            },
            {
                "name": "xcur", "value": null,
                "on": [
                    {
                        "events": "mousedown, touchstart, touchend",
                        "update": "slice(xdom)"
                    }
                ]
            },
            {
                "name": "ycur", "value": null,
                "on": [
                    {
                        "events": "mousedown, touchstart, touchend",
                        "update": "slice(ydom)"
                    }
                ]
            },
            {
                "name": "delta", "value": [0, 0],
                "on": [
                    {
                        "events": [
                            {
                                "source": "window", "type": "mousemove", "consume": true,
                                "between": [{"type": "mousedown"}, {"source": "window", "type": "mouseup"}]
                            },
                            {
                                "type": "touchmove", "consume": true,
                                "filter": "event.touches.length === 1"
                            }
                        ],
                        "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
                    }
                ]
            },
            {
                "name": "anchor", "value": [0, 0],
                "on": [
                    {
                        "events": "wheel",
                        "update": "[ invert('xscale', x()), invert('yscale', y())]"
                    }
                    // ,{
                    //     "events": {"type": "touchstart", "filter": "event.touches.length===2"},
                    //     "update": "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]"
                    // }
                ]
            },
            {
                "name": "zoom", "value": 1,
                "on": [
                    {
                        "events": "wheel!",
                        "force": true,
                        "update": "pow(1.001, event.deltaY)"
                        //"update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
                    }
                    // ,{
                    //     "events": {"signal": "dist2"},
                    //     "force": true,
                    //     "update": "dist1 / dist2"
                    // }
                ]
            },
            {
                "name": "dist1", "value": 0,
                "on": [
                    {
                        "events": {"type": "touchstart", "filter": "event.touches.length===2"},
                        "update": "pinchDistance(event)"
                    },
                    {
                        "events": {"signal": "dist2"},
                        "update": "dist2"
                    }
                ]
            },
            {
                "name": "dist2", "value": 0,
                "on": [{
                    "events": {"type": "touchmove", "consume": true, "filter": "event.touches.length===2"},
                    "update": "pinchDistance(event)"
                }]
            },
            { "name": "sizeLabelRange", "update": "[8,14]" },
            {
                "name": "sizeLabelDom", "update": "[8,14]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[ sizeLabelDom[0] * zoom, sizeLabelDom[1] * zoom]"
                    }
                ]
            },
            { "name": "sizeVertexRange", "update": "[50,300]" },
            {
                "name": "sizeVertexDom", "update": "[50,300]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[ sizeVertexDom[0] * zoom, sizeVertexDom[1] * zoom]"
                    }
                ]
            },
            {
                "name": "ydomLabelOffset", "update": "[0,height]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                      //  "sqrt(width*width+height*height)*0.5*2*-0.3"
                        "update": "[ydomLabelOffset[0], ydomLabelOffset[1]]" //if(ydomLabelOffset[1] * zoom > ydomLabelOffset[1],ydomLabelOffset[1],ydomLabelOffset[1])]" //ydomLabelOffset[1])]"
                        // "update": "[ydomLabelOffset[0]* zoom, if(ydomLabelOffset[1] * zoom > ydomLabelOffset[1],if(ydomLabelOffset[1]*zoom > 2*ydomLabelOffset[1],ydomLabelOffset[1]*zoom,ydomLabelOffset[1]),ydomLabelOffset[1])]"
                    }
                ]
            },
            {
                "name": "xdomContainment", "update": "[0,width]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[ xdomContainment[0] * zoom, xdomContainment[1] * zoom]"
                    }
                ]
            },
            {
                "name": "ydomContainment", "update": "[0,height]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[ydomContainment[0]* zoom, ydomContainment[1] * zoom]"
                    }
                ]
            },
            {
              "name": "xdom", "update": "[0,width]",
              "on": [
                  {
                      "events": {"signal": "delta"},
                      "update": "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]"
                  },
                  {
                      "events": {"signal": "zoom"},
                      "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
                  }
              ]
          },
            {
              "name": "ydom", "update": "[0,height]",
              "on": [
                  {
                      "events": {"signal": "delta"},
                      "update": "[ycur[0] - span(ycur) * delta[1] / height, ycur[1] - span(ycur) * delta[1] / height]"
                  },
                  {
                      "events": {"signal": "zoom"},
                      "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
                  }
              ]
          },
            {
                "name": "xdomC2", "update": "[0,width]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
                    }
                ]
            },
            {
                "name": "ydomC2", "update": "[0,height]",
                "on": [
                    {
                        "events": {"signal": "zoom"},
                        "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
                    }
                ]
            },

        ],
        "data": [
            {
                "name": "vertices",
                "values" : [ ]
            },
            {
                "name": "edges",
                "values" : [

                ],
                "transform": [
                    {
                        "type": "lookup",
                        "from": "vertices", "key": "id",
                        "fields": ["source", "target"], "as": ["source", "target"]
                    },
                    {
                        "type": "linkpath",
                        "shape": "diagonal",
                        "orient": "horizontal",
                        "sourceX": {"field": "source.x", "scale": "xscale"},
                        "sourceY": {"field": "source.y", "scale": "yscale"},
                        "targetX": { "field" : "target.x", "scale": "xscale" },
                        "targetY": { "field":  "target.y", "scale": "yscale"},
                        "as": "lp"
                    }
                ]
            },
            {
                "name": "rects",
                "values" : [ ]
            },
            {
                "name": "edges2",
                "values" : [

                ],
                "transform": [
                    {
                        "type": "lookup",
                        "from": "vertices", "key": "id",
                        "fields": ["source", "target"], "as": ["source", "target"]
                    }
                ]
            }


        ],
        "projections": [
        ],
        "scales": [
            {
                "name": "labelSizeScale", "zero": false,
                "domain": {"signal": "sizeLabelDom"},
                "range": {"signal": "sizeLabelRange"}
            },
            {
                "name": "vertexSizeScale", "zero": false,
                "domain": {"signal": "sizeVertexDom"},
                "range": {"signal": "sizeVertexRange"}
            },
          {
            "name": "xscaleC2", "zero": false,
            "domain": {"signal": "xdomC2"},
            "range": {"signal": "xrange"}
          },
          {
            "name": "yscaleC2", "zero": false,
            "domain": {"signal": "ydomC2"},
            "range": {"signal": "yrange"}
          },
            {
                "name": "xscale", "zero": false,
                "domain": {"signal": "xdom"},
                "range": {"signal": "xrange"}
            },
            {
                "name": "yscale", "zero": false,
                "domain": {"signal": "ydom"},
                "range": {"signal": "yrange"}
            },
            {
                "name": "xscaleC", "zero": false,
                "domain": {"signal": "xdomContainment"},
                "range": {"signal": "xrange"}
            },
            {
                "name": "yscaleLabel", "zero": false,
                "domain": {"signal": "ydomLabelOffset"},
                "range": {"signal": "yrange"}
            },
            {
                "name": "yscaleC", "zero": false,
                "domain": {"signal": "ydomContainment"},
                "range": {"signal": "yrange"}
            }
        ],
        "marks": [
            {
                "type": "symbol",
                "from": {"data": "vertices"},
                "encode": {
                    "enter": {
                        "size": {"field": "vertexSize"},
                        "tooltip": {"value": ""},
                        "fill": {"field": "color"},
                        "shape": {"field": "vertexShape"},
                        "opacity": {"field": "visible"},
                        "stroke": {"value": "white"},
                        "strokeWidth": {"value": 2.5},
                        "strokeOpacity": {"value": 0}
                    },
                    "update": {
                      "size": {"signal": "min(datum.vertexSize,scale('vertexSizeScale',datum.vertexSize))"},
                        "x": {"field": "x", "scale": "xscale"},
                        "y": {"field": "y", "scale": "yscale"}
                    }
                },
                "zindex":1
            },
            {
                "type": "rect",
                "from": {"data": "rects"},
                "encode": {
                    "enter": {
                        "fill": {"value": "#ffffff"},
                        "stroke": {"value": "#000000"}
                    },
                    "update": {
                        "x": {"field": "x", "scale": "xscale"},
                        "y": {"field": "y", "scale": "yscale"},
                        "width": {"field": "w", "scale": "xscaleC"},
                        "height": {"field": "h", "scale": "yscaleC"},
                        "blend": {"value" : "exclusion"},
                        "cornerRadius": {"value": "35"},
                        "strokeWidth": {"value": "2"}
                    }
                }
            },

            {
                "type": "path",
                "interactive": false,
                "from": {"data": "edges"},
                "encode": {
                    "enter": {
                        "stroke": {"field": "color"}
                    },
                    "update": {
                        "path": {"signal": "'M'+ " +
                                "scale('xscale',substring(split(datum.lp,',')[0],1)) + ',' + " +
                                "scale('yscale',split(split(datum.lp,',')[1],'C')[0]) + 'C' + " +
                                "scale('xscale',split(split(datum.lp,',')[1],'C')[1]) + ',' + " +
                                "scale('yscale',split(split(datum.lp,',')[2],' ')[0]) + ' '+ " +
                                "scale('xscale',split(split(datum.lp,',')[2],' ')[1]) + ',' + " +
                                "scale('yscale',split(split(datum.lp,',')[3],' ')[0]) + ','  + " +
                                "scale('xscale',split(split(datum.lp,',')[3],' ')[1])  +',' + " +
                                "scale('yscale',split(datum.lp,',')[4]) "}
                    }
                }
            },
            {
                "type": "path",
                "interactive": false,
                "from": {"data": "edges2"},
                "encode": {
                    "enter": {
                        "stroke": {"field": "color"}
                    },
                    "update": {
                        "path":  { "signal":  " 'M'+ " +
                                "scale('xscale',datum.source.x) + ',' + " +
                                "scale('yscale',datum.source.y) + 'L' + " +
                                "scale('xscale',datum.target.x) + ',' + " +
                                "scale('yscale',datum.target.y)" }
                    }}

                }
        ]
    };
 export const animationSpecification =
     {
         "$schema": "https://vega.github.io/schema/vega/v5.json",
         "description": "Graph Drawing",
         "width": 900,
         "height": 1900,
         "padding": { "top": 25, "left": 0,"right": 0,"bottom": 0},
         "autosize": "none",
         "signals": [
             {
                 "name": "shape", "value": "line"
             }
         ],
         "data": [
             {
                 "name": "vertices",
                 "values" : [ ]
             },
             {
                 "name": "edges",
                 "values" : [

                 ],
                 "transform": [
                     {
                         "type": "lookup",
                         "from": "vertices", "key": "id",
                         "fields": ["source", "target"], "as": ["source", "target"]
                     },
                     {
                         "type": "linkpath",
                         "shape": "diagonal",
                         "orient": "horizontal",
                         "sourceX": {"field": "source.x"},
                         "sourceY": {"field": "source.y"},
                         "targetX": { "field" : "target.x"},
                         "targetY": { "field":  "target.y"},
                         "as": "path"
                     }
                 ]
             },
             {
                 "name": "rects",
                 "values" : [ ]
             },
             {
                 "name": "edges2",
                 "values" : [

                 ],
                 "transform": [
                     {
                         "type": "lookup",
                         "from": "vertices", "key": "id",
                         "fields": ["source", "target"], "as": ["source", "target"]
                     },
                     {
                         "type": "linkpath",
                         "shape": "line",
                         "sourceX": {"field": "source.x"},
                         "sourceY": {"field": "source.y"},
                         "targetX": { "field" : "target.x"},
                         "targetY": { "field":  "target.y"},
                         "as": "path"
                     }
                 ]
             }


         ],
         "projections": [
         ],
         "scales": [
         ],
         "marks": [
             {
                 "type": "symbol",
                 "from": {"data": "vertices"},
                 "encode": {
                     "enter": {
                         "size": {"field": "vertexSize"},
                         "tooltip": {"value": ""},
                         "fill": {"field": "color"},
                         "shape": {"field": "vertexShape"},
                         "opacity": {"field": "visible"},
                         "stroke": {"value": "white"},
                         "strokeWidth": {"value": 2.5},
                         "strokeOpacity": {"value": 0}
                     },
                     "update": {
                         "size": {"field": "vertexSize"} ,
                         "x": {"field": "x"},
                         "y": {"field": "y"}
                     }
                 },
                 "zindex":1
             },
             {
                 "type": "rect",
                 "from": {"data": "rects"},
                 "encode": {
                     "enter": {
                         "fill": {"value": "#ffffff"},
                         "stroke": {"value": "#000000"}
                     },
                     "update": {
                         "x": {"field": "x"},
                         "y": {"field": "y"},
                         "width": {"field": "w"},
                         "height": {"field": "h"},
                         "blend": {"value" : "exclusion"},
                         "cornerRadius": {"value": "35"},
                         "strokeWidth": {"value": "2"}
                     }
                 }
             },

             {
                 "type": "path",
                 "interactive": false,
                 "from": {"data": "edges"},
                 "encode": {
                     "enter": {
                         "stroke": {"field": "color"}
                     }
                 }
             },
             {
                 "type": "path",
                 "interactive": false,
                 "from": {"data": "edges2"},
                 "encode": {
                     "enter": {
                         "stroke": {"field": "color"}
                     }
                 }
             }

         ]
     };
