# ODDViz - TEI ODD Visualizer

Visualize an ODD customization against TEI-all.

## Experimental

This is just a toy for now.

## Usage

Generate a JSON of your customization using TEI XSLTS (odds2/odd2json.xsl) and save it as odd.js in testdata.

JSON is served asynchronously, so run this on a server. 

For example, you can run a simple HTTP server with python:

python -m SimpleHTTPServer 8888

## License

http://www.apache.org/licenses/LICENSE-2.0