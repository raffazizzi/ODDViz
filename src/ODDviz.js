// Extend object to easily access properties in alternation
Object.prototype.anyOf = function(properties, emptyString) {
    properties = properties || function(a) { return a == false; };
    // By default, this method will not consider a property set to ""
    emptyString = (typeof emptyString === "undefined") ? false : emptyString;
    
    for (var i = 0; i < properties.length; i++){
        if (properties[i] in this) {
            if (!emptyString && this[properties[i]] == '') continue;
            else return [properties[i], this[properties[i]]];
        }
    }
    return false;
}

Object.prototype.noneOf = function(properties, emptyString) {
    properties = properties || function(a) { return a == false; };
    // By deafult, this method will not consider a property set to ""
    emptyString = (typeof emptyString === "undefined") ? false : emptyString;
    for (var i = 0; i < properties.length; i++){
        if ((emptyString && properties[i] in this && this[properties[i]] == '') || properties[i] in this && this[properties[i]] != '') {
            return false;
        }
    }
    return true;
}

var root = this;

root.ODDviz = {};

(function($, d3, ODDviz) {

flatten = function(array, property) {
    flat = []
    for (var i = 0; i < array.length; i++) {
        flat.push(property in array[i] ? array[i][property] : null);
    }
    return flat;
}

// Rendering and animation components

var onMouseOver = function(d){
    obj = d3.select(this);
    obj.style("stroke-width", "3"); 
    obj.style("stroke", colors.selected);
    tooltip.style("visibility", "visible")
        .text("ident" in d ? d.ident : ("key" in d && d.key !== '' ? d.key : d.url))  ;
} 

var onMouseMove = function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");}

var onMouseOut = function(){
    d3.select(this).style("stroke", "none");
    tooltip.style("visibility", "hidden").text("");
}

var colors = {
    'add' : 'Cyan',
    'change' : 'Orange',
    'delete' : 'Red',
    'included' : '#90EE90',
    'excluded' : 'White',
    'selected' : '#5F9EA0',
    'warning' : 'Yellow',
}

var paint = function(d) {
        //a definition
        if (d.noneOf(["key", "include"], true) && d.noneOf(["mode"])) {return colors.excluded}
        //an external component
        else if (d.anyOf(["url"])) {return colors.add;}
        //flagged
        else if (d.flag) {return colors.warning}
        //referenced, included
        else if (d.noneOf(["mode"])) {return colors.included;}
        //default
        else {return colors[d.mode];}
}

// Seting up SVG
var width = 960,
    height = 600;

var svg = d3.select("body").append("svg:svg")
    .attr("width", width)
    .attr("height", height);

// Get asynchronous data.
// Load customization first, because it's likely to be smaller; then load P5. <- is this good?
d3.json("testdata/odd.json", function(odd) {
    d3.json("testdata/p5.json", function(p5) {
        
        // Modules
        TEImodules = p5.modules;
        moduleRefs = odd.moduleRefs;
        moduleSpecs = odd.moduleSpec;

        // get modules not referenced
        var modules = TEImodules.filter(function(e, i) {
            for (var j = 0; j < moduleRefs.length; j++) {
                if (e.ident == moduleRefs[j].key) {
                  return 0
                }
            } 
            return 1
        });

        // add the refs
        modules.push.apply(modules, moduleRefs);

        // add new modules
        modules.push.apply(modules, moduleSpecs);

        modules.sort(function(a,b){
            nameA = !("ident" in a) ? a.key : a.ident
            nameB = !("ident" in b) ? b.key : b.ident
            // first sort by type, then sort alphabetically
            // TODO: Put added in the middle
            if ((!("ident" in a) && !("ident" in b)) || 
                ("ident" in a && "ident" in b)) {
                if (nameA > nameB) {
                    return 1;
                }
                else {return -1}
            }
            else if (!("ident" in a)){return -1;}
            else {return 1;}
            return 0;
        });

        // Finally, create a simplified list of active modules. 
        active_modules = [];
        for (var i = 0; i < modules.length; i++) {
            if ("key" in modules[i]) active_modules.push(modules[i].key);
            if (modules[i].mode == 'add' || modules[i].mode == 'change') active_modules.push(modules[i].ident);
        }

        // Classes
        TEIclasses = p5.modelclasses;
        classRefs = odd.classRefs;
        classSpecs = odd.modelclasses;
        
        // Flatten new classes
        CS_idents = flatten(classSpecs, "ident");

        classes = [];
        for (var i = 0; i < TEIclasses.length; i++) {
            // only push if not redefined in the customization ODD
            if (CS_idents.indexOf(TEIclasses[i].ident) == -1) {
                classes.push(TEIclasses[i]);
                if (active_modules.indexOf(TEIclasses[i].module) != -1) {
                    classes[classes.indexOf(TEIclasses[i])].include = 'yes';
                }
            }
        }

        // Include new or overriden classes from customization ODD
        classes.push.apply(classes, classSpecs);

        // Create a simplified list of active classes so far. 
        active_classes = [];
        for (var i = 0; i < classes.length; i++) {
            if ("key" in classes[i]) {active_classes.push(classes[i].key)}
            else if ("include" in classes[i]) {active_classes.push(classes[i].ident)}
        }

        // If references are part of an already referenced module, flag them.
        for (var i = 0; i < classRefs.length; i++) {
            if (active_classes.indexOf(classRefs[i].key) != -1) {
                classRefs[i].flag = 'Already included';
            }
        }

        // add the refs
        classes.push.apply(classes, classRefs);

        classes.sort(function(a,b){
            // first sort by type, then sort alphabetically
            if ((!("include" in a) && !("include" in b) ||
                ("include" in a && "include" in b))) {
                if (a.ident > a.ident) {
                    return 1;
                }
                else {return 0}
            }
            else if (!("include" in a)){return 1;}
            else {return 0;}
            return 0;
        });

        // Macros
        TEImacros = p5.macros;
        macroRefs = odd.macroRefs;
        macroSpecs = odd.macros
        
        // Flatten new macros
        MS_idents = flatten(classSpecs, "ident");

        macros = [];
        for (var i = 0; i < TEImacros.length; i++) {
            // only push if not redefined in the customization ODD
            if (MS_idents.indexOf(TEImacros[i].ident) == -1) {
                macros.push(TEImacros[i]);
                if (active_modules.indexOf(TEImacros[i].module) != -1) {
                    macros[macros.indexOf(TEImacros[i])].include = 'yes';
                }
            }
        }

        // Include new or overriden classes from customization ODD
        macros.push.apply(macros, macroSpecs);

        // Create a simplified list of active classes so far. 
        active_macros = [];
        for (var i = 0; i < macros.length; i++) {
            if ("key" in macros[i]) {active_macros.push(macros[i].key)}
            else if ("include" in macros[i]) {active_macros.push(macros[i].ident)}
        }

        // If references are part of an already referenced module, flag them.
        for (var i = 0; i < macroRefs.length; i++) {
            if (active_macros.indexOf(macroRefs[i].key) != -1) {
                macroRefs[i].flag = 'Already included';
            }
        }

        // add the refs
        macros.push.apply(macros, macroRefs);

        macros.sort(function(a,b){
            // first sort by type, then sort alphabetically
            if ((!("include" in a) && !("include" in b) ||
                ("include" in a && "include" in b))) {
                if (a.ident > a.ident) {
                    return 1;
                }
                else {return 0}
            }
            else if (!("include" in a)){return 1;}
            else {return 0;}
            return 0;
        });

        // Elements
        TEIelements = p5.elements;
        elementRefs = odd.elementRefs;
        elementSpecs = odd.macros

        // Flatten new macros
        ES_idents = flatten(elementSpecs, "ident");

        elements = [];
        for (var i = 0; i < TEIelements.length; i++) {
            // only push if not redefined in the customization ODD
            if (ES_idents.indexOf(TEIelements[i].ident) == -1) {
                elements.push(TEIelements[i]);
                if (active_modules.indexOf(TEIelements[i].module) != -1) {
                    elements[elements.indexOf(TEIelements[i])].include = 'yes';
                }
            }
        }

        // Include new or overriden classes from customization ODD
        elements.push.apply(elements, elementSpecs);

        // Create a simplified list of active classes so far. 
        active_elements = [];
        for (var i = 0; i < elements.length; i++) {
            if ("key" in elements[i]) {active_elements.push(elements[i].key)}
            else if ("include" in elements[i]) {active_elements.push(elements[i].ident)}
        }

        // If references are part of an already referenced module, flag them.
        for (var i = 0; i < elementRefs.length; i++) {
            if (active_elements.indexOf(elementRefs[i].key) != -1) {
                elementRefs[i].flag = 'Already included';
            }
        }

        // add the refs
        elements.push.apply(elements, elementRefs);

        elements.sort(function(a,b){
            // first sort by type, then sort alphabetically
            if ((!("include" in a) && !("include" in b) ||
                ("include" in a && "include" in b))) {
                if (a.ident > a.ident) {
                    return 1;
                }
                else {return 0}
            }
            else if (!("include" in a)){return 1;}
            else {return 0;}
            return 0;
        });

        // Now let's plot this, etc.

        // Set up a generic tooltip
        tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("font-size", "80%");

        svg.append("svg:g")
            .attr("class", "label")
            .text("s")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 100)
          .append("svg:text")
            .attr("class", "label")
            .text("Modules")
            .attr("x", -50)
            .attr("y", 12)
            .attr("transform", "rotate(270)");

        // Set scale for module data
        var modules_x = d3.scale.linear()
        .domain([0, modules.length])
        .range([22, width]); 

var clicktest = function() {
            d3.select('#closeup').style("display", "block");
        }

        modulesBar = svg.selectAll("rect.modules")
            .data(modules)
          .enter().append("svg:rect")
            .attr("x", 22)
            .attr("y", 0)
            .attr("width", width/modules.length-2)
            .attr("height", 100)
            .attr("title", function(d) {return "key" in d ? d.key : d.ident})
            .attr("fill", function(d) {return paint(d)})
            .on("mouseover", onMouseOver)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut)
            .on("click", clicktest)
          .transition()
            .delay(100)
            .duration(1000) 
            .attr("x", function(d, i) {return modules_x(i);});

        svg.append("svg:g")
            .attr("class", "label")
            .text("s")
            .attr("x", 0)
            .attr("y", 110)
            .attr("width", 20)
            .attr("height", 100)
          .append("svg:text")
            .attr("class", "label")
            .text("Classes")
            .attr("x", -50-110)
            .attr("y", 12)
            .attr("transform", "rotate(270)");        

        // Set scale for class data
        var classes_x = d3.scale.linear()
        .domain([0, classes.length])
        .range([22, width]); 

        classesBar = svg.selectAll("rect.classes")
            .data(classes)
          .enter().append("svg:rect")
            .attr("x", 22)
            .attr("y", 110)
            .attr("width",  width/classes.length-2)
            .attr("height", 100)
            .attr("title", function(d) {return "key" in d ? d.key : d.ident})
            .attr("fill", function(d) {return paint(d)})
            .on("mouseover", onMouseOver)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut)
          .transition()
            .delay(100)
            .duration(1000) 
            .attr("x", function(d, i) {return classes_x(i);});

        svg.append("svg:g")
            .attr("class", "label")
            .text("s")
            .attr("x", 0)
            .attr("y", 220)
            .attr("width", 20)
            .attr("height", 100)
          .append("svg:text")
            .attr("class", "label")
            .text("Macros")
            .attr("x", -50-220)
            .attr("y", 12)
            .attr("transform", "rotate(270)");

        // Set scale for module data
        var macros_x = d3.scale.linear()
        .domain([0, macros.length])
        .range([22, width]); 

        macrosBar = svg.selectAll("rect.macros")
            .data(macros)
          .enter().append("svg:rect")
            .attr("x", 22)
            .attr("y", 220)
            .attr("width",  width/macros.length-2)
            .attr("height", 100)
            .attr("title", function(d) {return "key" in d ? d.key : d.ident})
            .attr("fill", function(d) {return paint(d)})
            .on("mouseover", onMouseOver)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut)
          .transition()
            .delay(100)
            .duration(1000) 
            .attr("x", function(d, i) {return macros_x(i);});

        svg.append("svg:g")
            .attr("class", "label")
            .text("s")
            .attr("x", 0)
            .attr("y", 330)
            .attr("width", 20)
            .attr("height", 100)
          .append("svg:text")
            .attr("class", "label")
            .text("Elements")
            .attr("x", -50-330)
            .attr("y", 12)
            .attr("transform", "rotate(270)");

        elementsBar = function(elements_range, animate) {
            animate = (typeof animate === "undefined") ? false : animate;

            var elements_x = d3.scale.linear()
            .domain([0, elements_range.length])
            .range([22, width]); 

            svg.selectAll("rect.elements").remove();

            var rectElements = svg.selectAll("rect.elements")
                .data(elements_range)
              .enter().append("svg:rect")
                .attr("class", "elements")
                .attr("x", animate ? 22 :function(d, i) {return elements_x(i);})
                .attr("y", 330)
                .attr("width",  width/elements_range.length-2)
                .attr("height", 100)
                .attr("title", function(d) {return "key" in d ? d.key : d.ident})
                .attr("fill", function(d) {return paint(d)})
                .on("mouseover", onMouseOver)
                .on("mousemove", onMouseMove)
                .on("mouseout", onMouseOut);

            if (animate) rectElements.transition()
                .delay(100)
                .duration(1000) 
                .attr("x", function(d, i) {return elements_x(i);});
    }

        var element_start = 51;
        elementsBar(elements.slice(0,element_start), true);


        // Set scale for element data
        var elementsControl_x = d3.scale.linear()
        .domain([0, elements.length])
        .range([0, width]); 

        elementsControlBar = svg.selectAll("rect.elementsControl")
            .data(elements)
          .enter().append("svg:rect")
            .attr("x", 0)
            .attr("y", 440)
            .attr("width",  width/elements.length)
            .attr("height", 20)
            .attr("title", function(d) {return "key" in d ? d.key : d.ident})
            .attr("fill", function(d) {return paint(d)})
          .transition()
            .delay(100)
            .duration(1000) 
            .attr("x", function(d, i) {return elementsControl_x(i);});

        svg.append("g")
            .attr("class", "brush")
            .call(d3.svg.brush().x(d3.scale.linear().range([0, width]))
            .extent([0,element_start/elements.length])
            .on("brush", brushmove))
          .selectAll("rect")
            .attr("x", 0)
            .attr("y", 440)
            .attr("height", 20);

        function brushmove() {
            var s = d3.event.target.extent();
            var ext = s[1]-s[0];
            if (ext < 0.5 && ext > 0.03) {
                var start = Math.round((elements.length-1)*s[0]);
                var end = Math.round((elements.length-1)*s[1]);

                elementsBar(elements.slice(start,end));
            }
            else if (ext < 0.03) {
                d3.event.target.extent([s[0],s[0]+0.03]); d3.event.target(d3.select(this));
            }
            else {d3.event.target.extent([s[0],s[0]+0.5]); d3.event.target(d3.select(this));}            

        }

    });
});
})(jQuery, d3, ODDviz);