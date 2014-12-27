/*!
 * VisualEditor UserInterface MWChartInspector class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * MediaWiki gallery inspector.
 *
 * @class
 * @extends ve.ui.MWExtensionInspector
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.MWChartInspector = function VeUiMWChartInspector( config ) {
	// Parent constructor
	ve.ui.MWExtensionInspector.call( this, config );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWChartInspector, ve.ui.MWExtensionInspector );

/* Static properties */

ve.ui.MWChartInspector.static.name = 'chartInsert';

ve.ui.MWChartInspector.static.icon = 'picture';

ve.ui.MWChartInspector.static.title =
	OO.ui.deferMsg( 'visualeditor-MWChartInspector-title' );

ve.ui.MWChartInspector.static.nodeModel = ve.dm.MWGraphNode;

/* Methods */

/** */
ve.ui.MWChartInspector.prototype.getInputPlaceholder = function () {
	// 'File:' is always in content language
	return "Google chart here";
};

/* Registration */

ve.ui.inspectorFactory.register( ve.ui.MWChartInspector );
