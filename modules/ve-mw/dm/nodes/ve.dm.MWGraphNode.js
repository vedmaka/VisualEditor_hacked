/*!
 * VisualEditor DataModel MWGalleryNode class.
 *
 * @copyright 2011–2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * DataModel MediaWiki gallery node.
 *
 * @class
 * @extends ve.dm.MWExtensionNode
 *
 * @constructor
 */
ve.dm.MWGraphNode = function VeDmMWGraphNode( length, element ) {
	// Parent constructor
	ve.dm.MWExtensionNode.call( this, 0, element );
};

/* Inheritance */

OO.inheritClass( ve.dm.MWGraphNode, ve.dm.MWExtensionNode );

/* Static members */

ve.dm.MWGraphNode.static.name = 'mwGraph';

ve.dm.MWGraphNode.static.extensionName = 'chartinsert';

ve.dm.MWGraphNode.static.tagName = 'span';


/* Registration */

ve.dm.modelRegistry.register( ve.dm.MWGraphNode );
