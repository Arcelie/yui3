var ArrayList = Y.ArrayList,
	Bind = Y.bind,
	Recordset = Y.Base.create('recordset', Y.Base, [], {

    initializer: function() {
	
		//set up event listener to fire events when recordset is modified in anyway
		this.publish('add', {defaultFn: Bind("_defAddFn", this)});
		this.publish('remove', {defaultFn: Bind("_defRemoveFn", this)});
		this.publish('empty', {defaultFn: Bind("_defEmptyFn", this)});
		this.publish('update', {defaultFn: Bind("_defUpdateFn", this)});
		
		this._recordsetChanged();
    },
    
    destructor: function() {
    },
	
	/**
     * Helper method called upon by add() - it is used to create a new record(s) in the recordset
     *
     * @method _defAddFn
     * @param aRecord {Y.Record} A Y.Record instance
     * @param index {Number} (optional) Index at which to add the record(s)
     * @return {Y.Record} A Record instance.
     * @private
     */
	_defAddFn: function(e) {
		var len = this._items.length,
			rec = e.added,
			index = e.index;
		//index = (Y.Lang.isNumber(index) && (index > -1)) ? index : len;
		
		if (index === len) {
			this._items.push(rec);
		}
		else {
			this._items.splice(index,0,rec);
		}
		Y.log('add Fired');
	},
	
	_defRemoveFn: function(e) {
		var rem;
		if (e.index === 0) {
			this._items.pop();
		}
		else {
			this._items.splice(e.index,e.range);
		}
		
		Y.log('remove fired');
	},
	
	_defEmptyFn: function(e) {
		this._items = [];
		Y.log('empty fired');
	},
	
	_defUpdateFn: function(e) {
		var newRecords = [], i = 0;
		
		for (; i<e.updated.length; i++) {
			newRecords[i] = this._changeToRecord(data[i]);
			this._items[e.index + i] = newRecords[i];
		}
	},
	
	/**
     * Helper method called upon by update() - it updates the recordset when an array is passed in
     *
     * @method _updateGivenArray
     * @param arr {Array} An array of object literals or Y.Record instances
     * @param index {Number} The index at which to update the records.
     * @param overwriteFlag {boolean} (optional) A boolean to represent whether or not you wish to over-write the existing records with records from your recordset. Default is false. The first record is always overwritten.
     * @private
     */

	/*
	_updateGivenArray: function(arr, index, overwriteFlag) {
		var i = 0,
			overwrittenRecords = [],
			newRecords = [];
			
		for (; i < arr.length; i++) {
			//store everything being added into newRecords
			newRecords[i] = this._changeToRecord(arr[i]);
			
			//Arrays at the first index will always overwrite the one they are updating.
			if (i===0) {
				//splice returns an array with 1 object, so just get the object - otherwise this will become a nested array
				overwrittenRecords[i] = this.get('records').splice(index, 1, newRecords[i])[0];
				//console.log(overwrittenRecords[i]);
			}
			else {
				overwrittenRecords[i] = this._updateGivenObject(newRecords[i], index+i, overwriteFlag).overwritten[0];
				if (overwrittenRecords[i] === undefined) {
					overwrittenRecords.pop();
				}
			}
		}
		
		return ({updated:newRecords, overwritten:overwrittenRecords});
	}, 
	
	*/
	
	/**
     * Helper method called upon by update() and _updateGivenArray() - it updates the recordset when an array is passed in
     *
     * @method _updateGivenObject
     * @param obj {Object || Y.Record} Any objet literal or Y.Record instance
     * @param index {Number} The index at which to update the records.
     * @param overwriteFlag {boolean} (optional) A boolean to represent whether or not you wish to over-write the existing records with records from your recordset. Default is false. The first record is always overwritten.
     * @return {Y.Record || null} The overwritten Record instance, if it exists.

     * @private
     */

	/*
	_updateGivenObject: function(obj, index, overwriteFlag) {
		var oRecs = [], 
			overwrittenRecords = [];
			
		oRecs[0] = this._changeToRecord(obj);

		//If overwrite is set to true, splice and remove the record at current entry, otherwise just add it
		if (overwriteFlag) {
			overwrittenRecords[0] = this.get('records').splice(index,1,oRecs[0])[0];
		}
		else {
			this.get('records').splice(index,0,oRecs[0]);
		}
		
		//Always returning the object in an array so it can be iterated through
		return ({updated:oRecs, overwritten:overwrittenRecords});
	},
	*/
	
	/**
     * Helper method - it takes an object bag and converts it to a Y.Record
     *
     * @method _changeToRecord
     * @param obj {Object || Y.Record} Any objet literal or Y.Record instance
     * @return {Y.Record} A Record instance.
     * @private
     */
	_changeToRecord: function(obj) {
		var oRec;
		if (obj instanceof Y.Record) {
			oRec = obj;
		}
		else {
			oRec = new Y.Record({data:obj});
		}
		
		return oRec;
	},
	
	//---------------------------------------------
    // Events
    //---------------------------------------------
	
	/**
     * Event that is fired whenever the recordset is changed. Note that multiple simultaneous changes still fires this event once.
	 * (ie: Adding multiple records via an array will only fire this event once at the completion of all the additions)
     *
     * @method _recordSetUpdated
     * @private
     */
	_recordsetChanged: function() {
		
		this.on(['update', 'add', 'remove', 'empty'], function() {
			Y.log('change fire');
			this.fire('change', {});
		});
	},


	
	//---------------------------------------------
    // Public Methods
    //---------------------------------------------
	
	/**
     * Returns the record at a particular index
     *
     * @method getRecord
     * @param i {Number} Index at which the required record resides
     * @return {Y.Record} An Y.Record instance
     * @public
     */
    getRecord: function(i) {
        return this._items[i];
    },
	
	/**
     * Returns a range of records beginning at particular index
     *
     * @method getRecord
     * @param index {Number} Index at which the required record resides
	 * @param range {Number} (Optional) Number of records to retrieve. The default is 1
     * @return {Array} An array of Y.Record instances
     * @public
     */
	getRecords: function(index, range) {
		var i=0, returnedRecords = [];
		//Range cannot take on negative values
		range = (Y.Lang.isNumber(range) && (range > 0)) ? range : 1;
		
		for(; i<range; i++) {
			returnedRecords.push(this._items[index+i]);
		}
		return returnedRecords;
	},
	
	getLength: function() {
		return this.size();
	},
		
	/**
     * Returns an array of values for a specified key in the recordset
     *
     * @method getRecord
     * @param index {Number} (optional) Index at which the required record resides
     * @return {Array} An array of values for the given key
     * @public
     */
	getValuesByKey: function(key) {
		var i = 0, len = this._items.length, retVals = [];
		for( ; i < len; i++) {
			retVals.push(this._items[i].getValue(key));
		}
		return retVals;
	},
	

    /**
     * Adds one or more Records to the RecordSet at the given index. If index is null,
     * then adds the Records to the end of the RecordSet.
     *
     * @method add
     * @param oData {Y.Record, Object Literal, Array} A Y.Record instance, An object literal of data or an array of object literals
     * @param index {Number} (optional) Index at which to add the record(s)
     * @return {object} An object literal with two properties: "data" which contains array of Y.Record(s) and "index" which contains the index where the Y.Record(s) were added
     * @public
     */
	add: function(oData, index) {
		
		var oRecord, newRecords=[], idx, i;		
		idx = (Y.Lang.isNumber(index) && (index > -1)) ? index : this._items.length;
		//Passing in array of object literals for oData
		if (Y.Lang.isArray(oData)) {
			newRecords = [];

			for(i=0; i < oData.length; i++) {
				newRecords[i] = this._changeToRecord(oData[i]);
				this.fire('add', {added:newRecords[i], index:idx+i});
			}

		}
		//If it is an object literal of data or a Y.Record
		else if (Y.Lang.isObject(oData)) {
			this.fire('add', {added:this._changeToRecord(oData), index:idx});
		}
		return this;
	},
	
	/**
     * Removes one or more Records to the RecordSet at the given index. If index is null,
     * then removes a single Record from the end of the RecordSet.
     *
     * @method remove
     * @param index {Number} (optional) Index at which to remove the record(s) from
     * @param range {Number} (optional) Number of records to remove (including the one at the index)
     * @return {object} An object literal with two properties: "data" which contains the removed set {Y.Record or Y.Recordset} and "index" which contains the index where the Y.Record(s) were removed from
     * @public
     */
	remove: function(index, range) {
		var remRecords=[];
		
		//Default is to only remove the last record - the length is always 1 greater than the last index
		index = (index > -1) ? index : (this.size()-1);
		range = (range > 0) ? range : 1;
		
		remRecords = this._items.slice(index,(index+range));

		this.fire('remove', {removed: remRecords, range:range, index:index});
		//this._recordRemoved(remRecords, index);
		
		//return ({data: remRecords, index:index}); 
		return this;
	},
	
	/**
     * Empties the recordset
     *
     * @method empty
     * @public
     */
	empty: function() {
		this.fire('empty', {});
		return this;
	},
	
	
	update: function(data, index) {
		var len, rec, arr;
		
		//Whatever is passed in, we are changing it to an array so that it can be easily iterated in the _defUpdateFn method
		arr = (!(Y.Lang.isArray(data))) ? [data] : data;
		rec = this._items.slice(index, index+arr.length);
		this.fire('update', {updated:arr, overwritten:rec, index:index});
		
		return this;		
	}
	
	/**
     * Updates one or more records in the recordset with new records. New records can overwrite existing records or be appended at an index.
     *
     * @method update
     * @param oData {Object || Array || Y.Record}  This represents the data you want to update the record with. Can be an object literal, an array of object literals, a Y.Record instance or an array of Y.Record instances.
     * @param index {Number} The index at which to update the records.
     * @param overwriteFlag {boolean} (optional) Represents whether or not you wish to over-write the existing records with records from your recordset. Default is false. The first record is always overwritten.

     * @public
     */
	/*
	update: function(oData, index, overwriteFlag) {
		
		var data;
		
		if (Y.Lang.isArray(oData)) {
			data = this._updateGivenArray(oData, index, overwriteFlag);			
		}
		else if (Y.Lang.isObject(oData)) {
			//If its just an object, it will overwrite the existing one, so passing in true
			data = this._updateGivenObject(oData, index, true);
		}
		
		//fire event
		this._recordsetUpdated(data.updated, data.overwritten, index);
		return null;
	}
	*/
},
{
    ATTRS: {
        records: {
            validator: Y.Lang.isArray,
            getter: function () {
                // give them a copy, not the internal object
                return Y.Array(this._items);
            },
            setter: function (allData) {
				var records = [];
				function initRecord(oneData) {
					if (oneData instanceof Y.Record) {
						records.push(oneData);
					}
					else {
						o = new Y.Record({data:oneData});
						records.push(o);
					}
				}
				Y.Array.each(allData, initRecord);
                // ...unless we don't care about live object references
                this._items = Y.Array(records);
            },
			//for performance reasons, getters and setters aren't active until they are accessed. Set this to false, since 
			//they are needed to be active in order for the constructor to create the necessary records
			lazyAdd: false
        }
    }
});
Y.augment(Recordset, ArrayList);
Y.Recordset = Recordset;

