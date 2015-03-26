var debug = false;
var cacheName = 'cacheDbV2';
var cacheTableName = 'tableCache';
var oldFileCacheFolderName = 'FileCache';
var fileCacheFolderName = 'CrosspadFileCache';
var Log = require('tools/Log');

var TYPE_FILE = 'file';
var TYPE_JSON = 'json';

var expired = (1000 * 60 * 60 * 24 * 62); // 2 month
//var expired = (1000 * 60);

var conn = Titanium.Database.open(cacheName);

function Cache() {
	// Drop old databases
	conn.execute('DROP TABLE IF EXISTS registry');
	// Delete old cache
	var d = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, oldFileCacheFolderName);
	if (d.exists()) {
		d.deleteDirectory(true);
	}

	// Create current cache database
	conn.execute('CREATE TABLE IF NOT EXISTS ' + cacheTableName + ' (cacheKey TEXT PRIMARY KEY, cacheType TEXT, cacheValue TEXT, cacheChanged TEXT, cacheCreated TEXT)');

}

Cache.prototype.clear = function() {
	conn.execute('DELETE FROM ' + cacheTableName);
	var d = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName);
	if (d.exists()) {
		d.deleteDirectory(true);
	}
};

Cache.prototype.cleanup = function() {
	var createdBefore = "" + (Date.now() - expired);

	var rows = conn.execute('SELECT cacheValue FROM ' + cacheTableName + ' WHERE cacheCreated < ? AND cacheType = ?', createdBefore, TYPE_FILE);
	while (rows.isValidRow()) {
		var fileName = rows.fieldByName('cacheValue');
		var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName, fileName);
		if (file.exists) {
			file.deleteFile();
		}
		rows.next();
	}
	rows.close();

	conn.execute('DELETE FROM ' + cacheTableName + ' WHERE cacheCreated < ?', createdBefore);
};

Cache.prototype.info = function() {
	var result = {};
	var resultSet = conn.execute('SELECT count(cacheValue) as rowcount FROM ' + cacheTableName);
	if (resultSet.isValidRow()) {
		result.rowCount = resultSet.fieldByName('rowcount');
		resultSet.close();
	}
	var folder = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName);
	if (folder.exists()) {
		result.folderSize = folder.size;
		result.fileCount = folder.getDirectoryListing().length;
	}
	return result;
};

Cache.prototype.getJson = function(cacheKey) {
	return getByKey(conn, cacheKey);
};

Cache.prototype.getJsonChanged = function(request) {
	var cacheKey = JSON.stringify(request);
	return getChangedByKey(conn, cacheKey);
};

Cache.prototype.saveJson = function(cacheKey, cacheValue, changedName) {
	Log.debug('Save: ' + cacheKey, debug);
	var result = getChangedByKey(conn, cacheKey);
	if (null == result) {
		// Create keyname not found
		create(conn, cacheKey, TYPE_JSON, cacheValue, changedName);
	} else {
		// Update keyname found
		update(conn, cacheKey, cacheValue, changedName);
	}
};

Cache.prototype.deleteJson = function(cacheKey) {
	conn.execute('DELETE FROM ' + cacheTableName + ' WHERE cacheKey = ? and cacheType = ?', cacheKey, TYPE_JSON);
	return conn.rowsAffected;
};

Cache.prototype.getFile = function(url, tiObject, attributeName) {
	return getCacheFile(conn, url, tiObject, attributeName);
};

function create(conn, cacheKey, cacheType, cacheValue, cacheChanged) {
	//Ti.API.info("create: " + cname);
	var cacheCreated = Date.now() + "";
	conn.execute('INSERT INTO ' + cacheTableName + ' (cacheKey, cacheValue, cacheType ,cacheChanged, cacheCreated) VALUES(?, ?, ?, ?, ?)', cacheKey, cacheValue, cacheType, cacheChanged, cacheCreated);
	return conn.lastInsertRowId;
	//return the primary key for the last insert
}

function update(conn, cacheKey, cacheValue, cacheChanged) {
	//Ti.API.info("update: " + cname);
	var cacheCreated = Date.now() + "";
	conn.execute('UPDATE ' + cacheTableName + ' SET cacheValue = ?, cacheChanged = ?, cacheCreated = ? WHERE cacheKey = ?', cacheValue, cacheChanged, cacheCreated, cacheKey);
	return conn.rowsAffected;
	//return the number of rows affected by the last query
}

function deleteByKey(conn, cacheKey) {
	conn.execute('DELETE FROM ' + cacheTableName + ' WHERE cacheKey = ?', cacheKey);
	return conn.rowsAffected;
}

function getValueByKey(conn, cacheKey) {
	//Ti.API.info("gettime: " + cname);
	var resultSet = conn.execute('SELECT cacheValue FROM ' + cacheTableName + ' WHERE cacheKey = ? LIMIT 1', cacheKey);
	if (resultSet.isValidRow()) {
		var result = resultSet.fieldByName('cacheValue');
		resultSet.close();
		return result;
	} else {
		return null;
	}
}

function getByKey(conn, cacheKey) {
	//Ti.API.info("gettime: " + cname);
	var resultSet = conn.execute('SELECT cacheChanged, cacheCreated, cacheValue FROM ' + cacheTableName + ' WHERE cacheKey = ? LIMIT 1', cacheKey);
	if (resultSet.isValidRow()) {
		var result = {
			changed : resultSet.fieldByName('cacheChanged'),
			created : resultSet.fieldByName('cacheCreated'),
			value : resultSet.fieldByName('cacheValue')
		};
		resultSet.close();
		return result;
	} else {
		return null;
	}
}

function getChangedByKey(conn, cacheKey) {
	//	Log.debug("gettime: " + cacheKey, debug);
	var resultSet = conn.execute('SELECT cacheChanged FROM ' + cacheTableName + ' WHERE cacheKey = ? LIMIT 1', cacheKey);
	if (resultSet.isValidRow()) {
		var result = resultSet.fieldByName('cacheChanged');
		resultSet.close();
		//		Log.debug("gettime found: " + cacheKey, debug);
		return result;
	} else {
		return null;
	}
}

function getCreatedByKey(conn, cacheKey) {
	//Ti.API.info("gettime: " + cname);
	var resultSet = conn.execute('SELECT cacheCreated FROM ' + cacheTableName + ' WHERE cacheKey = ? LIMIT 1', cacheKey);
	if (resultSet.isValidRow()) {
		var result = resultSet.fieldByName('cacheCreated');
		resultSet.close();
		return result;
	} else {
		return null;
	}
}

function updateCreated(conn, cacheKey) {
	//Ti.API.info("update: " + cname);
	var cacheCreated = Date.now() + "";
	conn.execute('UPDATE ' + cacheTableName + ' SET cacheCreated = ? WHERE cacheKey = ?', cacheCreated, cacheKey);
	return conn.rowsAffected;
	//return the number of rows affected by the last query
}

function getCacheFile(conn, url, obj, attr) {
	Log.debug('getCacheFile: ' + url, debug);
	var fileName = null;
	var cacheChanged = null;

	var fileObj = getByKey(conn, url);
	if (fileObj) {
		if (fileObj.changed) {
			cacheChanged = new Date(parseFloat(fileObj.changed));
		}
		fileName = fileObj.value;
	}
	var file = null;
	var req = Ti.Network.createHTTPClient();

	Log.debug('getCacheFile: GET URL: ' + url, debug);
	req.open('GET', url);
	if (cacheChanged) {
		req.setRequestHeader('If-Modified-Since', cacheChanged.toUTCString());
	}
	req.onload = function(e) {
		if (req.status === 200) {
			var changed = Date.now();
			var datestring = req.getResponseHeader('Last-Modified');
			if (datestring) {
				changed = Date.parse(datestring);
				Log.debug('getCacheFile: GET URL: ' + url + ' OK Last-Modified: ' + datestring, debug);
			} else {
				Log.debug('getCacheFile: GET URL: ' + url + ' OK Last-Modified: not set', debug);
			}
			file = saveCacheFile(conn, url, req.responseData, changed.toString());
			obj[attr] = file.nativePath;
		} else if (req.status === 304) {
			file = getCacheFileByName(fileName);
			if (file) {
				Log.debug('getCacheFile: GET URL: ' + url + ' returned not changed. Using cached', debug);
				obj[attr] = file.nativePath;
			} else {
				obj[attr] = url;
				Log.error('getCacheFile: CACHE ERROR URL ' + url + ' removing from cache', debug);
				deleteByKey(conn, url);
			}
		} else {
			Log.debug('getCacheFile: GET status = ' + req.status + ' setting url on object ' + url, debug);
			obj[attr] = url;
		}
	};
	req.onerror = function(e) {
		if (e.source) {
			if (e.source.status === 304) {
				file = getCacheFileByName(fileName);
				if (file) {
					Log.debug('getCacheFile: GET URL: ' + url + ' returned not changed. Using cached', debug);
					obj[attr] = file.nativePath;
				} else {
					obj[attr] = url;
					Log.error('getCacheFile: CACHE ERROR URL ' + url + ' removing from cache', debug);
					deleteByKey(conn, url);
				}
			//} else {
				//Log.debug('getCacheFile: GET status = ' + e.source.status + ' setting url on object ' + url, debug);
				//obj[attr] = url;
			}
		} else {
			Log.debug('getCacheFile: GET status = ' + e.source.status + ' setting url on object ' + url, debug);
			obj[attr] = url;
		}
	};
	req.send();
	return null;
}

function getCacheFileByName(fileName) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName, fileName);
	if (file.exists) {
		return file;
	}
	return null;

}

function saveCacheFile(conn, url, object, lastModified) {
	var fileName = getValueByKey(conn, url);

	if (null == fileName) {
		// Create keyname not found
		fileName = Date.now();
		fileName += '.file';
		// + fileExt;
		create(conn, url, TYPE_FILE, fileName, lastModified);
	} else {
		// Update keyname found
		update(conn, url, fileName, lastModified);
	}

	//	var d = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileCacheFolderName);
	var d = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName);
	if (!d.exists()) {
		d.createDirectory();
	}

	//	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileCacheFolderName, fileName);
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName, fileName);
	if (file.exists) {
		file.deleteFile();
		//		file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fileCacheFolderName, fileName);
		file = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, fileCacheFolderName, fileName);
	}

	file.write(object);

	return file;
}

module.exports = Cache;
