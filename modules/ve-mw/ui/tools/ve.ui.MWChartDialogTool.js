/**
 * Created by vedmaka on 16.12.2014.
 */
/*!
 * VisualEditor MediaWiki media dialog tool classes.
 * hacked
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki UserInterface media insert tool.
 *
 * @class
 * @extends ve.ui.DialogTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */

ve.ui.MWChartInsertDialogTool = function VeUiMWChartInsertDialogTool( toolGroup, config ) {
	ve.ui.DialogTool.call( this, toolGroup, config );
};

OO.inheritClass( ve.ui.MWChartInsertDialogTool, ve.ui.DialogTool );

ve.ui.MWChartInsertDialogTool.static.name = 'chartInsert';

ve.ui.MWChartInsertDialogTool.static.group = 'object';

ve.ui.MWChartInsertDialogTool.static.icon = 'picture';

ve.ui.MWChartInsertDialogTool.static.title = 'Insert CSV Chart';

ve.ui.MWChartInsertDialogTool.static.commandName = 'chartInsert';

ve.ui.MWChartInsertDialogTool.static.template = null;

ve.ui.MWChartInsertDialogTool.static.modelClasses = [ ve.dm.MWGraphNode ];

ve.ui.toolFactory.register( ve.ui.MWChartInsertDialogTool );