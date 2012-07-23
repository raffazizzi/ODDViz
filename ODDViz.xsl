<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:tei="http://www.tei-c.org/ns/1.0"
    exclude-result-prefixes="xs" version="2.0">
    <!-- parse a customization, confront it with full source, give stats
    - how many things removed
    - how many added
    - how many changed (and how?)
    
    Evaluation:
    - does it have descs? Documentation?
    -->

    <xsl:variable name="specs" select="document('http://www.tei-c.org/release/xml/tei/odd/p5subset.xml')"/>

    <xsl:template match="/">
        <!-- These really ought to be xsl:keys, but I can't use key() in a for each on $specs!!  -->
        <xsl:variable name="moduleRefs">
            <xsl:sequence select="//tei:moduleRef"/>
        </xsl:variable>
        <xsl:variable name="classSpecs">
            <xsl:sequence select="//tei:classSpec"/>
        </xsl:variable>
        <xsl:variable name="elementSpecs">
            <xsl:sequence select="//tei:elementSpec"/>
        </xsl:variable>
        <xsl:variable name="macroSpecs">
            <xsl:sequence select="//tei:macroSpec"/>
        </xsl:variable>
        
        <html>
            <head><title>ODDViz</title>
                <link type="text/css" href="css/jit/base.css" rel="stylesheet" />
                <link type="text/css" href="css/jit/BarChart.css" rel="stylesheet" />
                <script type="text/JavaScript" src="js/lib/jquery-1.4.2.min.js"></script>
                <script type="text/JavaScript" src="js/lib/jit-yc.js"> </script>
                <script type="text/JavaScript" src="js/main.js"> </script>
                <script type="text/JavaScript">
  
  var Jmodules = {
      'color': [
        <xsl:for-each select="$specs//tei:moduleSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@ident]/@key" order="descending"/>
          <xsl:choose>
              <xsl:when test="$moduleRefs//tei:moduleRef[@key = current()/@ident]">
                  <xsl:text>'#1BE070',</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:text>'#ccc',</xsl:text>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:for-each>
      <xsl:for-each select="//tei:moduleSpec[@mode='add']">
          <xsl:text>'#42C0FB',</xsl:text>
      </xsl:for-each>],
      'label' : [
      <xsl:for-each select="$specs//tei:moduleSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@ident]/@key" order="descending"/>
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      <xsl:for-each select="//tei:moduleSpec[@mode='add']">
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      ],
      'values': [
      {
        'label': 'Modules: <xsl:value-of select="normalize-space(
            concat(count($specs//tei:moduleSpec[@ident=current()//tei:moduleRef/@key]) - count(//tei:moduleSpec[@mode='delete']), ' ',
            if (//tei:moduleSpec[@mode='add']) then concat('(+', count(//tei:moduleSpec[@mode='add']), ') ') else (), '/ ',
            count($specs//tei:moduleSpec)))"/>',
        'values': [
        <xsl:for-each select="$specs//tei:moduleSpec">
          <xsl:text>1,</xsl:text>
      </xsl:for-each>],
      }]
      
  };
  
  var Jclasses = {
      'color': [
        <xsl:for-each select="$specs//tei:classSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
          <xsl:choose>
              <xsl:when test="$classSpecs//tei:classSpec[@mode='change'][@ident = current()/@ident]">
                  <xsl:text>'#ED852F',</xsl:text>
              </xsl:when>
              <xsl:when test="$moduleRefs//tei:moduleRef[@key = current()/@module]">
                  <xsl:text>'#1BE070',</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:text>'#ccc',</xsl:text>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:for-each>
      <xsl:for-each select="//tei:classSpec[@mode='add']">
          <xsl:text>'#42C0FB',</xsl:text>
      </xsl:for-each>],
      'label' : [
      <xsl:for-each select="$specs//tei:classSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      <xsl:for-each select="//tei:classSpec[@mode='add']">
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      ],
      'values': [
      {
        'label': 'Classes: <xsl:value-of select="normalize-space(
            concat(count($specs//tei:classSpec[@module=current()//tei:moduleRef/@key]) - count(//tei:classSpec[@mode='delete']), ' ',
            if (//tei:classSpec[@mode='add']) then concat('(+', count(//tei:classSpec[@mode='add']), ') ') else (), '/ ',
            count($specs//tei:classSpec)))"/>',
        'values': [
        <xsl:for-each select="$specs//tei:classSpec">
          <xsl:text>1,</xsl:text>
      </xsl:for-each>],
      }]
      
  };
  
  var Jelements = {
      'color': [
        <xsl:for-each select="$specs//tei:elementSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
          
          <xsl:choose>
              <xsl:when test="$elementSpecs//tei:elementSpec[@mode='change'][@ident = current()/@ident]">
                  <xsl:text>'#ED852F',</xsl:text>
              </xsl:when>
              <xsl:when test="$elementSpecs//tei:elementSpec[@mode='delete'][@ident = current()/@ident]">
                  <xsl:text>'#E01B28',</xsl:text>
              </xsl:when>
              <xsl:when test="$moduleRefs//tei:moduleRef[@key = current()/@module]">
                  <xsl:text>'#1BE070',</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:text>'#ccc',</xsl:text>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:for-each>
      <xsl:for-each select="//tei:elementSpec[@mode='add']">
          <xsl:text>'#42C0FB',</xsl:text>
      </xsl:for-each>],
      'label' : [
      <xsl:for-each select="$specs//tei:elementSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      <xsl:for-each select="//tei:elementSpec[@mode='add']">
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      ],
      'values': [
      {
        'label': 'Elements: <xsl:value-of select="normalize-space(
            concat(count($specs//tei:elementSpec[@module=current()//tei:moduleRef/@key]) - count(//tei:elementSpec[@mode='delete']), ' ',
            if (//tei:elementSpec[@mode='add']) then concat('(+', count(//tei:elementSpec[@mode='add']), ') ') else (), '/ ',
            count($specs//tei:elementSpec)))"/>',
        'values': [
        <xsl:for-each select="$specs//tei:elementSpec">
          <xsl:text>1,</xsl:text>
      </xsl:for-each>],
      }]
      
  };
 
  var Jmacros = {
      'color': [
        <xsl:for-each select="$specs//tei:macroSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
            
          <xsl:choose>
              <xsl:when test="$macroSpecs//tei:macroSpec[@mode='change'][@ident = current()/@ident]">
                  <xsl:text>'#ED852F',</xsl:text>
              </xsl:when>
              <xsl:when test="$macroSpecs//tei:macroSpec[@mode='delete'][@ident = current()/@ident]">
                  <xsl:text>'#E01B28',</xsl:text>
              </xsl:when>
              <xsl:when test="$moduleRefs//tei:moduleRef[@key = current()/@module]">
                  <xsl:text>'#1BE070',</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                  <xsl:text>'#ccc',</xsl:text>
              </xsl:otherwise>
          </xsl:choose>
      </xsl:for-each>
      <xsl:for-each select="//tei:macroSpec[@mode='add']">
          <xsl:text>'#42C0FB',</xsl:text>
      </xsl:for-each>],
      'label' : [
      <xsl:for-each select="$specs//tei:macroSpec">
          <xsl:sort select="$moduleRefs//tei:moduleRef[@key = current()/@module]/@key" order="descending"/>
          <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      <xsl:for-each select="//tei:macroSpec[@mode='add']">
         <xsl:text>'</xsl:text><xsl:value-of select="@ident"/><xsl:text>',</xsl:text>
      </xsl:for-each>
      ],
      'values': [
      {
        'label': 'Macros: <xsl:value-of select="normalize-space(
            concat(count($specs//tei:macroSpec[@module=current()//tei:moduleRef/@key]) - count(//tei:macroSpec[@mode='delete']), ' ',
            if (//tei:macroSpec[@mode='add']) then concat('(+', count(//tei:macroSpec[@mode='add']), ') ') else (), '/ ',
            count($specs//tei:macroSpec)))"/>',
        'values': [
        <xsl:for-each select="1 to count($specs//tei:macroSpec) + count($macroSpecs//tei:macroSpec[@mode='add'])">
          <xsl:text>1,</xsl:text>
      </xsl:for-each>],
      }]
      
  };
  
  $(document).ready(function(){
  
  function drawGraph(json, div) {
  
  var barChart = new $jit.BarChart({
      //id of the visualization container
      injectInto: div,
      //whether to add animations
      animate: true,
      //horizontal or vertical barcharts
      orientation: 'vertical',
      //bars separation
      barsOffset: 20,
      //visualization offset
      Margin: {
        top:5,
        left: 5,
        right: 5,
        bottom:5
      },
      //labels offset position
      labelOffset: 5,
      //bars style
      type: useGradients? 'stacked:gradient' : 'stacked',
      //whether to show the aggregation of the values
      showAggregates:false,
      //whether to show the labels for the bars
      showLabels:true,
      //labels style
      Label: {
        type: labelType, //Native or HTML
        size: 13,
        family: 'Arial',
        color: 'black'
      },
      //add tooltips
      Tips: {
        enable: true,
        onShow: function(tip, elem) {
          var Ttext = elem.name;
          if (elem.color == '#ED852F') {Ttext = elem.name + '. you CHANGED this.'}
          else if (elem.color == '#E01B28') {Ttext = elem.name + '. you DELETED this.'}
          else if (elem.color == '#42C0FB') {Ttext = elem.name + '. you ADDED this.'}
          tip.innerHTML = "<b>" + Ttext + "</b>";
        }
      }
    });
    //load JSON data.
    barChart.loadJSON(json);
    }
    
    drawGraph(Jmodules, 'modules');
    drawGraph(Jclasses, 'classes');
    drawGraph(Jmacros, 'macros');
    drawGraph(Jelements, 'elements');
    
  });
                </script>
                <!--<style type="text/css">
                    #elements {height: <xsl:value-of select="((count($specs//tei:elementSpec[@module=current()//tei:moduleRef/@key]) - count(//tei:elementSpec[@mode='delete'])) + count(//tei:elementSpec[@mode='add']))*10"/>}
                </style>-->
            </head>
            <body>
                <h1>Customization: <xsl:value-of select="normalize-space(//tei:teiHeader/tei:fileDesc/tei:titleStmt/tei:title)"/></h1>
                <div id="modules" class="infovis" style="float:left;"></div>
                <div id="classes" class="infovis" style="float:left;"></div>
                <div id="macros" class="infovis" style="float:left;"></div>
                <div id="elements" class="infovis" style="float:left;"></div>
                <div style="float:left;">
                    <ul id="id-list">
                        <li><div class="query-color" style="background-color:#1BE070">&#160;</div>Included in customization</li>
                        <li><div class="query-color" style="background-color:#ccc">&#160;</div>Not in customization</li>
                        <li><div class="query-color" style="background-color:#E01B28">&#160;</div>Explicitly deleted</li>
                        <li><div class="query-color" style="background-color:#ED852F">&#160;</div>Changed</li>
                        <li><div class="query-color" style="background-color:#42C0FB">&#160;</div>Added</li>
                    </ul>
                </div>
            </body>
        </html>
            </xsl:template>

</xsl:stylesheet>
