/*!
 * VisualEditor user interface MediaInsertDialog class.
 * hacked
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/*global mw */

/**
 * Dialog for inserting MediaWiki media objects.
 *
 * @class
 * @extends ve.ui.Dialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.MWChartInsertDialog = function VeUiMWChartInsertDialog( config ) {
	// Configuration initialization
	config = ve.extendObject( { 'size': 'large' }, config );

	// Parent constructor
	ve.ui.Dialog.call( this, config );

	// Properties
	this.item = null;
	this.referenceModel = null;
	this.sources = {};
	this.graphData = null;
	this.transclusion = null;
	this.transclusionNode = null;
	this.inserting = true;
	this.csvFile = null;
	this.chartTypeValue = 'bar';
};

/* Inheritance */

OO.inheritClass( ve.ui.MWChartInsertDialog, ve.ui.Dialog );

/* Static Properties */

ve.ui.MWChartInsertDialog.static.name = 'chartInsert';

ve.ui.MWChartInsertDialog.static.title =
	'Insert CSV Chart';

ve.ui.MWChartInsertDialog.static.icon = 'picture';



/* Methods */

ve.ui.MWChartInsertDialog.prototype.restoreLoad = function() {

	this.$spinner.show();
	this.applyButton.setLabel('Update chart');
	var selfw = this;

	this.chartType.chooseItem( this.chartType.getItemFromData( this.transclusionNode.element.attributes.mw.attrs.type || 'bar' ) );
	this.chartTitle.setValue( this.transclusionNode.element.attributes.mw.attrs.title || '' );
	this.chartHeight.setValue( this.transclusionNode.element.attributes.mw.attrs.height || '' );


	if( !this.csvFile ) {
		return;
	}

	ve.init.mw.Target.static.apiRequest({
		'action': 'query',
		'titles': this.csvFile,
		'namespace': 6,
		'suggest': '',
		'prop': 'imageinfo',
		'iiprop': 'url'
	}).done( function(data){

		if( data.query.pages ) {

			var pages = [];
			$.each( data.query.pages, function(i,v){
				pages.push(v);
			});

			selfw.onSearchSelect(pages[0]);

		}

	});

};

/**
 * Handle search result selection.
 *
 * @param {ve.ui.MWMediaResultWidget|null} item Selected item
 */
ve.ui.MWChartInsertDialog.prototype.onSearchSelect = function ( item ) {
	this.item = item;
	if ( item ) {
		//this.close( { 'action': 'insert' } );
		//Start graph processing

		this.$spinner.show();

		this.panels.setItem( this.editPanel );

		if( this.inserting ) {
			this.chartType.chooseItem( this.chartType.getItemFromData('bar') );
		}

		/**
		 * Here we should do few things:
		 * 1. Initialize Google-graphs library
		 * 2. Fetch content from CSV file and convert it into DataTables (extension?)
		 * 3. Feed Graph with content and display it
		 */

		var self = this;

		//Store file name into variable
		this.csvFile = item.title;
		this.transclusion.csvFile = this.csvFile;

		var fileUrl = item.imageinfo[0].url;
		var fileContent = '';
		$.get(fileUrl, function(data){
			fileContent = data;console.log(fileContent);

			var csvData = Papa.parse(fileContent, {
				header: true
			});

			var dataArr = [
				csvData.meta.fields
			];

			$(csvData.data).each(function(i,v){
				var itemArr = [];
				$(csvData.meta.fields).each(function(i2,v2){
					var arValue = v[v2];
					//if( /^\+?(0|[1-9]\d*)$/.test(arValue) ) {
					if( Number(arValue) == arValue ) {
							arValue = parseFloat(arValue);
					}
					itemArr.push(arValue);
				});
				dataArr.push(itemArr);
			});

			self.$spinner.hide();
			self.drawChart(dataArr, {
				title: this.csvFile,
				hAxis: {title: csvData.meta.fields[0]},
				yAxis: {title: csvData.meta.fields[1]}
			});

			self.applyButton.setDisabled(false);

			//StoreData
			self.graphData = dataArr;

		});


	}
};

ve.ui.MWChartInsertDialog.prototype.drawChart = function(dataArr, options) {

	var data = google.visualization.arrayToDataTable(dataArr);

	if( options == undefined ) {
		options = {
			title: 'Sample graph'
			//hAxis: {title: 'x', titleTextStyle: {color: 'red'}},
			//yAxis: {title: 'y', titleTextStyle: {color: 'blue'}}
		};
	}

	var chart;
	switch( this.chartTypeValue ) {
		case "bar":
			chart = new google.visualization.ColumnChart( this.chartDiv.get(0) );
			break;
		case "pie":
			chart = new google.visualization.PieChart( this.chartDiv.get(0) );
			break;
		default:
			chart = new google.visualization.ColumnChart( this.chartDiv.get(0) );
			break;
	}

	chart.draw(data, options);

};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.initialize = function () {
	// Parent method
	ve.ui.Dialog.prototype.initialize.call( this );

    var self = this;

	this.defaultThumbSize = mw.config.get( 'wgVisualEditorConfig' )
		.defaultUserOptions.defaultthumbsize;

	//Texts
	this.helpText = new OO.ui.Widget({
		'$': this.$,
		'$content': 'Please start typing to search and select CSV file to be drawn or ',
		'classes': ['helpText-widget']
	});

	this.uploadLink =new OO.ui.ButtonWidget({
		'$': this.$,
		'label': 'Upload csv',
        'classes': ['chart-upload-link']
	});
    this.uploadInput = $('<input type="file" id="chart-upload" style="display: none;" />');

    this.uploadLink.$element.append( this.uploadInput );

	//Buttons
	this.applyButton = new OO.ui.ButtonWidget( {
		'$': this.$,
		'label': 'Insert graph',
		'flags': ['primary']
	} );

	// Widget
	this.search = new ve.ui.MWFileSearchWidget( {
		'$': this.$
	} );

	//ChartDiv
	this.chartDiv = $('<div/>');
	$(this.chartDiv).addClass('we-ui-MWChartInsertDialog-chart');
	$(this.chartDiv).attr('id','g_chart_div');

	//Control elements
	this.panels = new OO.ui.StackLayout( { '$': this.$ } );

	this.editPanel = new OO.ui.PanelLayout( {
		'$': this.$, 'scrollable': true, 'padded': true
	} );

	this.searchPanel = new OO.ui.PanelLayout( { '$': this.$ } );

	this.optionsFieldset = new OO.ui.FieldsetLayout( {
		'$': this.$,
		'label': 'Options',
		'icon': 'settings'
	} );

	this.chartTitle = new OO.ui.TextInputWidget({
		'$': this.$,
		'placeholder': 'Sample chart'
	});

	this.chartTitleField = new OO.ui.FieldLayout( this.chartTitle, {
		'$': this.$,
		'align': 'top',
		'label': 'Title'
	} );

	this.chartHeight = new OO.ui.TextInputWidget({
		'$': this.$,
		'placeholder': '400'
	});

	this.chartHeightField = new OO.ui.FieldLayout( this.chartHeight, {
		'$': this.$,
		'align': 'top',
		'label': 'Height (pixels)'
	} );

	this.chartType = new OO.ui.SelectWidget({
		'$': this.$,
		'items': [
			new OO.ui.OptionWidget(
				'bar',
				{
					'label': 'Bar',
					'icon': 'picture'
				}
			),
			new OO.ui.OptionWidget(
				'pie',
				{
					'label': 'Pie',
					'icon': 'picture'
				}
			)
		]
	});

	this.chartTypeField = new OO.ui.FieldLayout( this.chartType, {
		'$': this.$,
		'align': 'top',
		'label': 'Select chart type'
	} );

	// Initialization
	this.search.$element.addClass( 've-ui-MWChartInsertDialog-select' );

	// Events
	this.search.connect( this, { 'select': 'onSearchSelect' } );
	this.applyButton.connect( this, { 'click': [ 'close', { 'action': 'insert' } ] } );
	this.applyButton.setDisabled(true);
	this.chartType.connect( this, {'select': 'onChartTypeSelect'} );
    this.uploadLink.connect( this, {'click': 'onUploadLinkClick'} );
    this.uploadInput.unbind();
    this.uploadInput.bind( 'change', function(){ self.onUploadChange(self) } );

	//Set spinner
	this.$spinner = this.$( '<div>' ).addClass( 've-specialchar-spinner' );

	//Append to layout
	this.$body.append( this.$spinner );
	//this.$body.append( this.search.$element );

	//Controls
	this.panels.addItems( [  this.searchPanel, this.editPanel] );

	this.editPanel.$element.append( this.chartDiv );
	this.editPanel.$element.append( this.optionsFieldset.$element );
	this.optionsFieldset.addItems( [ this.chartTitleField ] );
	this.optionsFieldset.addItems( [ this.chartHeightField ] );
	this.optionsFieldset.addItems( [ this.chartTypeField ] );

    this.helpText.$element.append( this.uploadLink.$element );
	this.searchPanel.$element.append( this.helpText.$element );
	this.searchPanel.$element.append( this.search.$element );

	this.$body.append( this.panels.$element );
	this.$foot.append( this.applyButton.$element );

};

ve.ui.MWChartInsertDialog.prototype.onUploadChange = function( ve ) {

    var inputElem = this.uploadInput.get(0);

    if( inputElem.files.length ) {

        //ve.uploadLink.$element.hide();

        var fd = new FormData();

        fd.append('file', inputElem.files[0]);
        fd.append('token', mw.user.tokens.get('editToken'));

        var self = this;
        $.ajax({
            url: '/api.php?action=upload&format=json&ignorewarnings=1&filename=' + inputElem.files[0].name,
            type: 'POST',
            data: fd,
            enctype: 'multipart/form-data',
            processData: false,
            contentType: false
        }).done(function (data) {
            if ( data.upload && data.upload.result && data.upload.result == 'Success') {
                var uploadedName = data.upload.filename;
                ve.search.$element.find('input').val(uploadedName);
                ve.search.onQueryChange();
                ve.search.queryMediaSources();
                ve.search.$element.find('input').focus();
                ve.search.$element.find('input').trigger('keydown');
            }
        });

        this.uploadInput.val('');

    }

};

ve.ui.MWChartInsertDialog.prototype.onUploadLinkClick = function() {
    this.uploadInput.trigger('click');
};

ve.ui.MWChartInsertDialog.prototype.onChartTypeSelect = function() {

	var data = this.chartType.getSelectedItem().data || 'bar';

	this.chartTypeValue = data;
	this.transclusion.chartType = data;

	if( this.graphData ) {
		$(this.chartDiv).html('');
		this.drawChart(this.graphData);
	}
};

/**
 * Get the transclusion node to be edited.
 *
 * @returns {ve.dm.MWTransclusionNode|null} Transclusion node to be edited, null if none exists
 */
ve.ui.MWChartInsertDialog.prototype.getTransclusionNode = function () {
	var focusedNode = this.getFragment().getSelectedNode();
	return focusedNode instanceof ve.dm.MWGraphNode ? focusedNode : null;
};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.setup = function ( data ) {

	var transclusionNode = this.getTransclusionNode();

	// Parent method
	ve.ui.Dialog.prototype.setup.call( this, data );

	this.transclusion = new ve.dm.MWGraphModel();
	this.transclusionNode = transclusionNode instanceof ve.dm.MWGraphNode ? transclusionNode : null;
	this.inserting = !this.transclusionNode;

	// Show a spinner while we check for file repos.
	// this will only be done once per session.
	//
	// This is in .setup rather than .initialize so that
	// the user has visual indication (spinner) during the
	// ajax request
	this.$spinner.show();
	$(this.chartDiv).html('');

	this.panels.setItem( this.searchPanel );

	//Load
	if( !this.inserting ) {
		//Load data
		this.csvFile = this.transclusionNode.element.attributes.mw.body.extsrc;
		this.chartTypeValue = this.transclusionNode.element.attributes.mw.attrs.type;
		this.restoreLoad();
		return;
	}

	// Get the repos from the API first
	// The ajax request will only be done once per session
	this.getFileRepos().done( ve.bind( function ( repos ) {
		if ( repos ) {
			this.sources = repos;
			this.search.setSources( this.sources );
		}
		// Done, hide the spinner
		this.$spinner.hide();

		// Show the search and query the media sources
		this.search.queryMediaSources();

		// Initialization
		// This must be done only after there are proper
		// sources defined
		this.search.getQuery().$input.focus().select();
		this.search.getResults().selectItem();
		this.search.getResults().highlightItem();
	}, this ) );

};

/**
 * Get the object of file repos to use for the media search
 * @returns {jQuery.Promise}
 */
ve.ui.MWChartInsertDialog.prototype.getFileRepos = function () {
	var deferred = $.Deferred();

	// We will only ask for the ajax call if this.sources
	// isn't already set up
	if ( ve.isEmptyObject( this.sources ) ) {
		// Take sources from api.php?action=query&meta=filerepoinfo&format=jsonfm
		// The decision whether to take 'url' or 'apiurl' per each repository is made
		// in the MWMediaSearchWidget depending on whether it is local and has apiurl
		// defined at all.
		ve.init.mw.Target.static.apiRequest( {
			'action': 'query',
			'meta': 'filerepoinfo'
		} )
		.done( function ( resp ) {
			deferred.resolve( resp.query.repos );
		} )
		.fail( function () {
			deferred.resolve( [ {
				'url': mw.util.wikiScript( 'api' ),
				'local': true
			} ] );
		} );
	} else {
		// There was no need to ask for the resources again
		// return false so we can skip setting the sources
		deferred.resolve( false );
	}

	return deferred.promise();

};

/**
 * Save changes.
 */
ve.ui.MWChartInsertDialog.prototype.saveChanges = function () {
	var surfaceModel = this.getFragment().getSurface();

	//Setup fields into model
	this.transclusion.chartTitle = this.chartTitle.getValue() || 'Sample chart';
	this.transclusion.chartHeight = this.chartHeight.getValue() || '400';

	if ( this.transclusionNode instanceof ve.dm.MWGraphNode ) {
		this.transclusion.updateTransclusionNode( surfaceModel, this.transclusionNode );
	} else {
		this.transclusion.insertTransclusionNode( surfaceModel );
	}
};

/**
 * @inheritdoc
 */
ve.ui.MWChartInsertDialog.prototype.teardown = function ( data ) {

	// Data initialization
	data = data || {};

	if ( data.action === 'insert' ) {

		/**
		 * In this section we should do few things:
		 *
		 * 1. Check which action is performing
		 * 2. Get stored information from google graphs and prepare transclusion model
		 * 3. Push transclusion model into surface
		 * TODO: inspector actions
		 */

		this.saveChanges();

	}

	this.search.clear();
	this.transclusion.disconnect( this );

	// Parent method
	ve.ui.Dialog.prototype.teardown.call( this, data );
};

/* Registration */

ve.ui.dialogFactory.register( ve.ui.MWChartInsertDialog );
