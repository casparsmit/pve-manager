Ext.define('PVE.grid.PendingObjectGrid', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pvePendingObjectGrid'],

    getObjectValue: function(key, defaultValue, pending) {
	var me = this;
	var rec = me.store.getById(key);
	if (rec) {
	    var value = (pending && Ext.isDefined(rec.data.pending) && (rec.data.pending !== '')) ? 
		rec.data.pending : rec.data.value;

            if (Ext.isDefined(value) && (value !== '')) {
		return value;
            } else {
		return defaultValue;
            }
	}
	return defaultValue;
    },

    renderValue: function(value, metaData, record, rowIndex, colIndex, store) {
	var me = this;
	var rows = me.rows;
	var key = record.data.key;
	var rowdef = (rows && rows[key]) ?  rows[key] : {};
	var renderer = rowdef.renderer;
	var current = '';
	var pendingdelete = '';
	var pending = '';

	if (renderer) {
	    current = renderer(value, metaData, record, rowIndex, colIndex, store, false);
	    if (Ext.isDefined(record.data.pending) && (record.data.pending !== '')) {
		pending = renderer(record.data.pending, metaData, record, rowIndex, colIndex, store, true);
	    }
	    if (pending == current) {
		pending = undefined;
	    }
	} else {
	    current = value;
	    pending = record.data.pending;
	}

	if (record.data['delete']) {
	    pendingdelete = '<div style="text-decoration: line-through;">'+ current +'</div>';
	}

	if (pending || pendingdelete) {
	    return current + '<div style="color:red">' + pending + pendingdelete + '</div>';
	} else {
	    return current;
	}
    },

    initComponent : function() {
	var me = this;

	var rows = me.rows;

	if (!me.rstore) {
	    if (!me.url) {
		throw "no url specified";
	    }

	    me.rstore = Ext.create('PVE.data.ObjectStore', {
		model: 'KeyValuePendingDelete',
		readArray: true,
		url: me.url,
		interval: me.interval,
		extraParams: me.extraParams,
		rows: me.rows
	    });
	}

	var rstore = me.rstore;

	var store = Ext.create('PVE.data.DiffStore', { rstore: rstore });

	if (me.sorterFn) {
	    store.sorters.add(new Ext.util.Sorter({
		sorterFn: me.sorterFn
	    }));
	}

	store.filters.add(new Ext.util.Filter({
	    filterFn: function(item) {
		if (rows) {
		    var rowdef = rows[item.data.key];
		    if (!rowdef || (rowdef.visible === false)) {
			return false;
		    }
		}
		return true;
	    }
	}));

	PVE.Utils.monStoreErrors(me, rstore);


	Ext.applyIf(me, {
	    store: store,
	    hideHeaders: true,
	    stateful: false,
	    columns: [
		{
		    header: gettext('Name'),
		    width: me.cwidth1 || 100,
		    dataIndex: 'key',
		    renderer: me.renderKey
		},
		{
		    flex: 1,
		    header: gettext('Value'),
		    dataIndex: 'value',
		    renderer: me.renderValue
		}
	    ]
	});

	me.callParent();
   }
});