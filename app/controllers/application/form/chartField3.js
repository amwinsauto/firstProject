exports.baseController = "application/form/baseField";

var args = arguments[0] || {};
var form = args.form;
var data = args.data;
var sectionData = args.sectionData;

// Chart
var styleWidthSmall = '100%';
var styleHeightSmall = 150;

var styleWidthMedium = '100%';
var styleHeightMedium = 180;

var styleWidthLarge = '100%';
var styleHeightLarge = 300;

var styleWidthExtraLarge = '100%';
var styleHeightExtraLarge = 600;
var height = styleHeightMedium;
var width = 0;
var sliceTextSize = undefined;
if (data.size === 'small') {
	height = styleHeightSmall;
	//	width = styleWidthSmall;
} else if (data.size === 'medium') {
	height = styleHeightMedium;
	sliceTextSize = 13;
	//	width = styleWidthMedium;
} else if (data.size === 'large') {
	height = styleHeightLarge;
	sliceTextSize = 14;
	//	width = styleWidthLarge;
} else if (data.size === 'extralarge') {
	height = styleHeightExtraLarge;
	sliceTextSize = 14;
	//	width = styleWidthExtraLarge;
}

$.fieldTableViewRow.height = height;

function createChart() {

	var options = {
		title : data.title ? data.title.toString() : undefined,
		titleTextStyle : {
			color : 'black',
			fontSize : 16,
			bold : false
		},
		legend : {
			position : 'none'
		}
	};
	if (sectionData.layout === 'transparent') {
		options.backgroundColor = 'transparent';
		$.webView.backgroundColor = 'transparent';
	}

	var chartData = [];
	var chartType = '';
	var chartPackages = 'corechart';
	var xAxisLegends = null;
	var xAxisInterval = null;
	var yAxisLegends = null;
	var yAxisInterval = null;
	var showLegend = null;
	var legendPosition = null;

	// if (data.xaxis) {
	// if (data.xaxis.interval) {
	// xAxisInterval = data.xaxis.interval;
	// }
	// if (data.xaxis.locations) {
	// xAxisLegends = {};
	// for (var i = 0; i < data.xaxis.locations.length; i++) {
	// xAxisLegends[data.xaxis.locations[i].value.toString()] = data.xaxis.locations[i].title;
	// }
	// }
	// }
	// if (data.yaxis) {
	// if (data.yaxis.interval) {
	// yAxisInterval = data.yaxis.interval;
	// }
	// if (data.yaxis.locations) {
	// yAxisLegends = {};
	// for (var i = 0; i < data.yaxis.locations.length; i++) {
	// yAxisLegends[data.yaxis.locations[i].value.toString()] = data.yaxis.locations[i].title;
	// }
	// }
	// }
	//
	// if (data.plots.length === 1 && data.plots[0].type === 'pie') {
	// options.is3D = data.is3d == false ? false : true;
	// options.pieSliceText = 'none';
	//
	// chartType = 'PieChart';
	// var plot = data.plots[0];
	// var plotData = plot.data || [];
	// if (plot.showlabels) {
	// options.pieSliceText = 'value';
	// }
	// if (data.label) {
	// //options.pieSliceText = 'value';
	// options.pieSliceText = 'percentage';
	// options.pieSliceTextStyle = {
	// bold : true,
	// fontSize : sliceTextSize
	// };
	// }
	//
	// if (plot.pieslicetext) {
	// options.pieSliceText = plot.pieslicetext.toString();
	// }
	//
	// // Fix for textile
	// if (plotData.length === 2) {
	// options.colors = [getColor('red'), getColor('green')];
	// }
	// if (xAxisLegends) {
	// options.legend.position = 'right';
	// }
	//
	// options.slices = [];
	// chartData.push(['Legend', 'Value']);
	// for (var j = 0; j < plotData.length; j++) {
	// var value = plotData[j];
	// var slice = {};
	// if (value.color) {
	// slice.color = getColor(value.color);
	// }
	// if (value.offset) {
	// slice.offset = value.offset;
	// }
	// options.slices.push(slice);
	// var legend = value.title || value.legend || null;
	// var cValue = value.value || value.y;
	// if (legend) {
	// options.legend.position = 'right';
	// chartData.push([getxAxisLegend(legend), cValue]);
	// } else {
	// chartData.push([getxAxisLegend(value.x), cValue]);
	// }
	//
	// }
	// } else if (data.plots.length === 1 && data.plots[0].type === 'gauge') {
	//
	// chartType = 'Gauge';
	// chartPackages = 'gauge';
	// var plot = data.plots[0];
	// var plotData = plot.data || [];
	// options.greenColor = getColor('green');
	// options.yellowColor = getColor('yellow');
	// options.redColor = getColor('red');
	//
	// if (data.min) {
	// options.min = parseFloat(data.min);
	// }
	// if (data.max) {
	// options.max = parseFloat(data.max);
	// }
	// if (data.greenfrom) {
	// options.greenFrom = parseFloat(data.greenfrom);
	// }
	// if (data.greento) {
	// options.greenTo = parseFloat(data.greento);
	// }
	// if (data.yellowfrom) {
	// options.yellowFrom = parseFloat(data.yellowfrom);
	// }
	// if (data.yellowto) {
	// options.yellowTo = parseFloat(data.yellowto);
	// }
	// if (data.redfrom) {
	// options.redFrom = parseFloat(data.redfrom);
	// }
	// if (data.redto) {
	// options.redTo = parseFloat(data.redto);
	// }
	// if (data.majorticks) {
	// options.majorTicks = data.majorticks;
	// }
	// // options.majorTicks
	// if (data.minorticks) {
	// options.minorTicks = parseInt(data.minorticks, 10);
	// }
	//
	// chartData.push(['Legend', 'Value']);
	// for (var j = 0; j < plotData.length; j++) {
	// var value = plotData[j];
	// var legend = value.title || value.legend || null;
	// var cValue = value.value || value.y;
	// if (legend) {
	// chartData.push([getxAxisLegend(legend), cValue]);
	// } else {
	// chartData.push([getxAxisLegend(value.x), cValue]);
	// }
	//
	// }
	// } else {
	// chartType = 'ComboChart';
	// options.seriesType = 'lines';
	// options.series = {};
	//
	// if (data.xaxis && data.xaxis.title) {
	// options.hAxis = {
	// title : data.xaxis.title.toString()
	// };
	// } else {
	// if (data.xaxistitle) {
	// options.hAxis = {
	// title : data.xaxistitle.toString()
	// };
	// }
	// }
	//
	// if (data.yaxis && data.yaxis.title) {
	// options.vAxis = {
	// title : data.yaxis.title.toString()
	// };
	// } else {
	// if (data.yaxistitle) {
	// options.vAxis = {
	// title : data.yaxistitle.toString()
	// };
	// }
	//
	// }
	// // Push legend array
	// chartData.push(['X']);
	// for (var i = 0; i < data.plots.length; i++) {
	// var plot = data.plots[i];
	// var plotData = plot.data || [];
	// var color = getColor(plot.color);
	//
	// // Legends
	// var legend = plot.legend;
	// if (!legend) {
	// legend = plot.title;
	// }
	// if (legend) {
	// options.legend.position = 'top';
	// }
	// chartData[0].push( legend ? legend.toString() : '');
	//
	// if (plot.showlabels) {
	// // TODO Missing labels support
	// }
	//
	// if (plot.type === 'line') {
	// options.series[i.toString()] = {
	// type : 'line',
	// color : color ? color : undefined,
	// pointSize : 4,
	// lineWidth : plot.linewidth ? plot.linewidth : undefined
	// };
	// for (var j = 0; j < plotData.length; j++) {
	// addComboRow(chartData, plotData[j], i, j);
	// }
	// } else if (plot.type === 'bar') {
	// options.series[i.toString()] = {
	// type : 'bars',
	// color : color ? color : undefined
	// };
	// if (data.isstacked) {
	// options.isStacked = data.isstacked ? true : false;
	// }
	// for (var j = 0; j < plotData.length; j++) {
	// addComboRow(chartData, plotData[j], i, j);
	// }
	// } else if (plot.type === 'area') {
	// options.series[i.toString()] = {
	// type : 'area',
	// color : color ? color : undefined
	// };
	// if (data.isstacked) {
	// options.isStacked = data.isstacked ? true : false;
	// }
	// for (var j = 0; j < plotData.length; j++) {
	// addComboRow(chartData, plotData[j], i, j);
	// }
	// } else if (plot.type === 'steppedarea') {
	// options.series[i.toString()] = {
	// type : 'steppedArea',
	// color : color ? color : undefined
	// };
	// if (data.isstacked) {
	// options.isStacked = data.isstacked ? true : false;
	// }
	// for (var j = 0; j < plotData.length; j++) {
	// addComboRow(chartData, plotData[j], i, j);
	// }
	// }
	// }
	// addMissingComboRowValues(chartData);
	//}

	// if (data.legendposition) {
	// options.legend.position = data.legendposition.toString();
	// }
	//
	// function addComboRow(toData, value, plotIndex, valueIndex) {
	// var legend = value.title || value.legend || null;
	// var cValue = value.value || value.y || 0;
	// var showLegend = false;
	// if (legend) {
	// showLegend = true;
	// legend = legend.toString();
	// legend = getxAxisLegend(legend);
	// } else {
	// legend = getxAxisLegend(value.x);
	// }
	// if (plotIndex === 0) {
	// toData.push([legend, cValue]);
	// // var v = [
	// // ['X', 'Leg1', 'Leg2'],
	// // ['2005', 10],
	// // ['2006', 20]
	// // ];
	// } else {
	// if (toData.length <= valueIndex + 1) {
	// toData.push([legend, cValue]);
	// // var v = [
	// // ['X', 'Leg1', 'Leg2'],
	// // ['2005', 10],
	// // ['2006', 20],
	// // ['2007', 30],
	// // ];
	// } else {
	// toData[valueIndex + 1].push(cValue);
	// // var v = [
	// // ['X', 'Leg1', 'Leg2'],
	// // ['2005', 10, 20],
	// // ['2006', 20],
	// // ['2007', 30],
	// // ];
	// }
	// }
	// return showLegend;
	// }

	// function getxAxisLegend(v) {
	// if (v == undefined) {
	// return '';
	// }
	//
	// var str = v.toString();
	// if (str) {
	// if (xAxisLegends && xAxisLegends[str]) {
	// return xAxisLegends[str];
	// }
	// return str;
	// }
	// return '';
	// }
	//

	//
	// function addMissingComboRowValues(toData) {
	// // var v = [
	// // ['X', 'Leg1', 'Leg2'],
	// // ['2005', 10, 20],
	// // ['2006', 20],
	// // ['2007', 30],
	// // ];
	// var length = toData[0].length;
	// for (var i = 1; i < toData.length; i++) {
	// while (toData[i].length < length) {
	// toData[i].push(0);
	// }
	// }
	// // var v = [
	// // ['X', 'Leg1', 'Leg2'],
	// // ['2005', 10, 20],
	// // ['2006', 20, 0],
	// // ['2007', 30, 0],
	// // ];
	//
	// }

	var html = '';
	html += '<!DOCTYPE HTML>';
	html += '<html>';
	html += '	<head>';
	html += '		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
	html += '		<meta name="viewport" content="width=' + width + ', initial-scale=1">';
	html += '		<title>No title</title>';
	html += '		<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>';
	html += '		<style type="text/css">';
	html += '${demo.css}';
	html += '		</style>';
	html += '		<script type="text/javascript">';
	html += '$(function () {';
	html += "    $('#container').highcharts(" + JSON.stringify(toPie(data)) + ');';
	html += '});';
	html += '		</script>';
	html += '	</head>';
	html += '	<body style="padding: 0px; margin: 0px;">';
	html += '<script src="js/highcharts.js"></script>';
	html += '<script src="js/highcharts-3d.js"></script>';
	html += '<script src="js/modules/exporting.js"></script>';
	html += '<div id="container" style="min-width: ' + width + 'px; height: ' + (height - 2) + 'px; margin: 0 auto"></div>';
	html += '	</body>';
	html += '</html>';
	$.webView.html = html;
}

function toPie(data) {
	var pie = {
		chart : {
			type : 'pie',
			options3d : {
				enabled : data.is3d == false ? false : true,
				alpha : 45,
				beta : 0
			}
		},
		title : {
			text : data.title ? data.title.toString() : '',
		},
		tooltip : {
			//			pointFormat : '{series.name}: <b>{point.percentage:.1f}%</b>'
			pointFormat : '<b>{point.y:.1f}</b>'
		},

		legend : {
			align : 'right',
			verticalAlign : 'top',
			layout : 'vertical',
			//x: 0,
			//y: 100
		},
		credits : {
			enabled : false,
		},
		exporting : {
			enabled : false
		},
		plotOptions : {
			pie : {
				showInLegend : true,
				//allowPointSelect : true,
				//cursor : 'pointer',
				depth : 15,
				//dataLabels : {
				//	enabled : true,
				//	format : '{point.name}'
				//}
				dataLabels : {
					enabled : true,
					distance : -20,
					format : '{point.y}',
					style : {
						//fontWeight : 'bold',
						color : 'white',
						//textShadow : '0px 1px 2px black'
					}
				}
			}
		},
		series : []

	};

	var plots = data.plots;
	_.each(plots, function(plot) {
		var serie = {
			type : 'pie',
			name : plot.name,
			data : []
		};
		_.each(plot.data, function(plotData) {
			var serieData = {
				name : plotData.title,
				y : plotData.y,
				color : getColor(plotData.color)
			};
			serie.data.push(serieData);
		});

		pie.series.push(serie);

	});

	return pie;

}

$.webView.addEventListener('postlayout', setWidth);
function setWidth(e) {
	if (e.source && e.source.rect && e.source.rect.width > 0) {
		//$.webView.removeEventListener('postlayout', setWidth);
		if (e.source.rect.width != width) {
			width = parseFloat(e.source.rect.width);
			createChart();
		}
	}
}

function onLoad(e) {
	// var dataStr = JSON.stringify(data);
	// setTimeout(function(e) {
	// if (!$.webView.evalJS('loadChartData(' + dataStr + ')')) {
	// setTimeout(function(e) {
	// Ti.API.info('onLoad calling loadChartData() 2 time');
	// if (!$.webView.evalJS('loadChartData(' + dataStr + ')')) {
	// setTimeout(function(e) {
	// Ti.API.info('onLoad calling loadChartData() 3 time');
	// if (!$.webView.evalJS('loadChartData(' + dataStr + ')')) {
	// setTimeout(function(e) {
	// Ti.API.info('onLoad calling loadChartData() 4 time');
	// if (!$.webView.evalJS('loadChartData(' + dataStr + ')')) {
	// }
	// }, 500);
	// }
	// }, 500);
	// }
	// }, 500);
	// }
	// }, 500);
}

function getColor(c) {
	if (c) {
		c = c.toLowerCase();
		if (c === 'red') {
			return $.fieldTableViewRow.egColorRed;
		} else if (c === 'yellow') {
			return $.fieldTableViewRow.egColorYellow;
		} else if (c === 'green') {
			return $.fieldTableViewRow.egColorGreen;
		} else if (c === 'blue') {
			return $.fieldTableViewRow.egColorBlue;
		} else if (c === 'gray') {
			return $.fieldTableViewRow.egColorGray;
		} else if (c === 'white') {
			return $.fieldTableViewRow.egColorWhite;
		} else if (c === 'black') {
			return $.fieldTableViewRow.egColorBlack;
		} else {
			return c;
		}
	}
	return undefined;
}

exports.getLabel = function() {
	return null;
};
