var fs = require('fs');

function parseRow(d) {
  var items = d.split(',').map(function(x) {
    try {
      return JSON.parse(x);
    } catch (e) {
      return x;
    }
  });
  var row = JSON.stringify(items);
  return row;
}

function metadata(filename, callback) {
  var stream  = fs.createReadStream(filename, {encoding: 'utf-8'});
  var buffer = '';
  var size = 0;
  var count = 0;
  stream.on('data', function(data) {
    buffer += data.toString();
    var parts = buffer.split('\n');
    parts.forEach(function(d, i){
      if (i == parts.length-1) return;
      var row = parseRow(d);
      size = Math.max(size, row.length);
      count += 1;
    });
    buffer = parts[parts.length-1];
  });
  stream.on('end', function() {
    callback({
      size: size,
      count: count,
      parser: 'JSON.parse',
      filename: filename
    });
  });
}

function rows(meta, infile) {
  var stream  = fs.createReadStream(infile, {encoding: 'utf-8'});
  var buffer = '';
  var metastr = JSON.stringify(meta);
  var metasize = metastr.length;
  for(var i=0;i<4;i++) {
    process.stdout.write(String.fromCharCode(metasize >> (8*i)))
  }
  process.stdout.write(metastr);
  stream.addListener('data', function(data) {
    buffer += data.toString();
    var parts = buffer.split('\n');
    parts.forEach(function(d, i){
      if (i == parts.length-1) { return; }
      var row = parseRow(d);
      padding = meta.size - row.length + 1;
      row += Array(padding).join('\n');
      process.stdout.write(row);
    });
    buffer = parts[parts.length-1];
  });
}

var filename = process.argv[2];
metadata(filename, function(meta) {
  rows(meta, filename);
});
