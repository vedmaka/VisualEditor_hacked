/*!
 * VisualEditor ContentEditable MWGalleryNode class.
 *
 * @copyright 2011–2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki gallery node.
 *
 * @class
 * @extends ve.ce.MWExtensionNode
 *
 * @constructor
 * @param {ve.dm.MWGalleryNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.MWGraphNode = function VeCeMWGraphNode( model, config ) {

	// Parent constructor
	ve.ce.MWExtensionNode.call( this, model, config );

};

/* Inheritance */

OO.inheritClass( ve.ce.MWGraphNode, ve.ce.MWExtensionNode );

/* Static Properties */

ve.ce.MWGraphNode.static.name = 'mwGraph';

ve.ce.MWGraphNode.static.tagName = 'div';

ve.ce.MWGraphNode.static.primaryCommandName = 'chartInsert';

ve.ce.MWGraphNode.prototype.render = function ( generatedContents ) {
	if ( this.live ) {
		this.emit( 'teardown' );
	}
	this.$element.empty().append( this.getRenderedDomElements( ve.copyDomElements( generatedContents ) ) );
	if ( this.live ) {
		this.emit( 'setup' );
		this.afterRender( generatedContents );
	}
	//horray!
	if( window.reInitializeChart ) {
		window.reInitializeChart( this.$element.find('.google-chart-container') );
	}
};

ve.ce.MWGraphNode.prototype.onrenderEnd = function() {
	console.log('onrenderEnd');
};

/* Registration */

ve.ce.nodeFactory.register( ve.ce.MWGraphNode );
