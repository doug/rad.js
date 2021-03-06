Using range headers and fixed byte width data rows to serve large static data records to javascript. Dumb simple, fast, easy.

The header metadata is just JSON. The size of the metadata is encoded in the first for characters as a little-endian uint32. The rest of the header is again just JSON.

Range requests work by default on Google Cloud storage, and many other cloud storage locations.

###Header Info

The inline parser or url to parser is dangerous but you are loading up data you should trust your source. Rad can also take an explicit parser during setup which will then ignore any parsers defined in the file, if you are paranoid.

All manipulation is on rows. Rows are the fundamental unit they can be whatever you want.

If you want to sort or filter your data do that with writing out different static files or just use a database.

```javascript
[litte-endian uint32 size of header]
{
	"count": 600,  // is the total number of rows [required]
	"size": 80,  // is the size of a single row in bytes [required]
	"parser": "JSON.parse",  // inline parser string or url to js parser code [optional]
	"filename": "name",  // the files name [optional]
	"description": "description"  // description of data [optional]
}
```

###Testing
Generate test data
Start local server that supports Range-Requests
Run QUnit tests

```
sh generate-test-data.sh
python extras/RangeHTTPServer.py 8080
open localhost:8080/test.html
```

When encoding json as a row pad with spaces so JSON.parse can handle the trailing whitespace.

```javascript
rad.file("/filename.rad", 
	function(file) {
		// Get an item
		file.get(10, function(item) {
			console.log('item 10', item);
		});

		// Get a set of items, -1 means read till the end
		file.get(0, -1, function(items) {
			console.log('all items', items);
		});

		// generate an iterator for a range of items
		var items = file.iter(0, -1);

		items.next(function(item) {
			console.log(item);
		});

		file.forEach(function(item) {
			console.log('each item as fast as I can.')
		});

	}
}, {
	header_size: 10000, // custom header size, default: 2000 bytes
	memory: 10000 // max memory to use in fetching chunks, default: 10000 bytes
});

```
