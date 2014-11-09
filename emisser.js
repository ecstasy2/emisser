var EventEmitter= require('events').EventEmitter,
  inherits= require('inherits')

var _emit= EventEmitter.prototype.emit,
  _slice= Array.prototype.slice

function Emisser(){
	EventEmitter.call(this)

	/// Long term storage for Emitted events
	var _store= [],
	  _oldest= -1
	Object.defineProperty(this, '_store', {
		get: function(){
			return _store
		},
		set: function(val){
			_store= val
		}
	})
	Object.defineProperty(this, '_oldest', {
		get: function(){
			return _oldest
		},
		set: function(val){
			_oldest= val
		}
	})

	

	/// New listeners
	this.on('newListener', function(name, b, c, d){
		_call(this._handleEmissionToNewListener, this, arguments, name, b, c, d)
	})
}
inherits(Emisser, EventEmitter)

Emisser.prototype._handleEmissionToNewListener= (function emissionToNewListener(name, listener){

	// check for store
	if(!this._store.length){
		return
	}

	// add to beginning of store
	var storeStart= this._store[0]
	  queue= storeStart[2]|| (storeStart[2]= [])
	queue.push(name, listener)

	// check for replayer
	var needReplayer= this._oldest === -1
	// reset replayer
	this._oldest= 0
	// run replayer if not running
	if(needReplayer){
		var self= this,
		  interval
		function replay(){
			while(1){
				var oldest= self._oldest
				if(oldest >= self._store.length || oldest === -1){
					// nothing left in store to send
					// done, shut down
					self._oldest= -1
					clearInterval(interval)
					return
				}else{
					// this pass will get us one-less old in our replaying of store
					++self._oldest
				}

				//  pick out record's listenerSet, make sure it exists
				var record= self._store[oldest]
				var listenerSet= record[2]
				record[2]= null
				if(!listenerSet || !listenerSet.length)
					// apparently someone external has cleaned listeners out of the store?
					continue

				// move all listeners into next recordSet
				var next= self._store[oldest+1]
				if(!next){
				}else if(next[2]){
					next[2]= next[2].concat(listenerSet)
				}else{
					next[2]= listenerSet
				}

				// run the record against the listeners
				dispatch(self, record, listenerSet)
				return
			}
			
		}
		interval= setInterval(replay , 0)
	}
})

// run listener set, which is zipped up name,listener pairs
function dispatch(self, record, listenerSet){
	for(var i in listenerSet){
		if(listenerSet[i++] === record[0]){
			var listener= listenerSet[i]
			listener.apply(self, record[1])
		}
	}
}

Emisser.prototype.emit= (function emit(name, a, b, c){
	// store
	var record= [name,_slice.call(arguments, 1),null]
	this._store.push(record)

	var noOld = this._oldest === -1
	if(noOld){
		// no replaying in progress, emit now
		_call(_emit, this, arguments, name, a, b, c)
	}else if(name === 'newListener'){
		this._handleEmissionToNewListener(a, b)
	}
})

function _call(fn, self, args, a, b, c, d){
	if(args.length === 1){
		return fn.call(self, a)
	}else if(args.length === 2){
		return fn.call(self, a, b)
	}else if(args.length === 0){
		return fn.call(self)
	}else if(args.length === 3){
		return fn.call(self, a, b, c)
	}else if(args.length === 4){
		return fn.call(self, a, b, c, d)
	}else{
		return fn.apply(self, args)
	}
}

module.exports= Emisser
