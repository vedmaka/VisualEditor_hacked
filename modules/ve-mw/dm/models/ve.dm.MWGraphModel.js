/*!
 * VisualEditor DataModel MWGraphModel class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

( function () {
	var hasOwn = Object.hasOwnProperty,
		specCache = {};

	/**
	 * MediaWiki graph model.
	 *
	 * @class
	 * @mixins OO.EventEmitter
	 *
	 * @constructor
	 */
	ve.dm.MWGraphModel = function VeDmMWGraphModel() {
		// Mixin constructors
		OO.EventEmitter.call( this );

		// Properties
		this.uid = 0;
		this.dataArr = [];
		this.csvFile = '';
		this.chartTitle = 'Sample chart';
		this.chartType = 'bar';
		this.chartHeight = 400;

	};

	/* Inheritance */

	OO.mixinClass( ve.dm.MWGraphModel, OO.EventEmitter );

	/* Events */

	/**
	 * @event replace
	 * @param {ve.dm.MWTransclusionPartModel|null} removed Removed part
	 * @param {ve.dm.MWTransclusionPartModel|null} added Added part
	 */

	/**
	 * @event change
	 */

	/* Methods */

	/**
	 * Insert transclusion into a surface.
	 *
	 * Transclusion is inserted at the current cursor position in `surfaceModel`.
	 *
	 * @param {ve.dm.Surface} surfaceModel Surface model of main document
	 * @param {ve.Range} [at] Location to insert at
	 */
	ve.dm.MWGraphModel.prototype.insertTransclusionNode = function ( surfaceModel, at ) {
		surfaceModel
			.getFragment( at || surfaceModel.getSelection().clone(), true )
			.collapseRangeToEnd()
			.insertContent( [
				{
					'type': 'mwGraph',
					'attributes': {
						'mw': {
							'body': {
								'extsrc': this.csvFile
							},
							'attrs': {
								'type': this.chartType,
								'title': this.chartTitle,
								'height': this.chartHeight
							},
							'name': 'chartInsert'
						}
					}
				},
				{
					'type': '/mwGraph'
				}
			] );
	};

	/**
	 * Update transclusion node in a document.
	 *
	 * @param {ve.dm.Surface} surfaceModel Surface model of main document
	 * @param {ve.dm.MWTransclusionNode} node Transclusion node to update
	 */
	ve.dm.MWGraphModel.prototype.updateTransclusionNode = function ( surfaceModel, node ) {
			surfaceModel.getFragment( node.getOuterRange(), true )
				.removeContent();
			this.insertTransclusionNode( surfaceModel );
	};


	/**
	 * Get the wikitext for this transclusion.
	 *
	 * @returns {string} Wikitext like `{{foo|1=bar|baz=quux}}`
	 */
	ve.dm.MWGraphModel.prototype.getWikitext = function () {

		return 'hello world!';
	};

}() );
