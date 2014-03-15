/**
 *
 *  @overview
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 *
 */

var
	// privates
	path = require('path'),
	fs = require('fs'),

	// paths
	specPath = path.resolve(__dirname + '/specs'),
	appPath = path.resolve(__dirname + '/mocks').replace(/\\/g, '/'),
	// other exports

	specs = listDir(specPath, 'js'),
	sources = listDir(appPath, 'js')
;
function listDir(fpath, ext){
	var dirList = fs.readdirSync(fpath);
		rList = []
	;
	dirList.forEach(function(item){
		var RPath = path.resolve(fpath + '/' + item),
			stat = fs.statSync(RPath)
		;
		if(stat.isDirectory()){
			rList.concat(listDir(RPath, ext));
		}else if(!ext || (item.substring(item.length - ext.length) === ext)){
			rList.push(RPath);
		}
	});

	rList.sort();
	return rList;
}



module.exports = /** @lends Info */{
	path: {
		app: appPath,
		specs: specPath
	},

	sources: sources,
	specs: specs,
	
	refreshSpecs: function(){
		exports.specs = listDir(specPath, 'js');
	}
};
