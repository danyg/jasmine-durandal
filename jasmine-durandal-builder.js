/*
The MIT License (MIT)

Copyright (c) 2014 Daniel Goberitz <dalgo86@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* 
 * 
 *  @overview 
 *  @author Daniel Goberitz <dalgo86@gmail.com>
 * 
 */
(function(){
	
	'use strict';
	
	var fs = require('fs'),
		path = require('path'),
		builder,
		validArgs = ['main', 'basedir', 'output']
	;
	
	function listDir(fpath, ext){
		var dirList = fs.readdirSync(fpath),
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

	builder = {
		_entryPoint: null,
		_args: {},
		
		_baseFile: null,
		_basePath: null,
		_outputPath: null,
		_outputFile: null,
		_licenseFile: null,
		_mainFile: null,
		_files: null,
		_baseRJSId: null,

		_parseCliArgs: function(){
			var cliArgs = process.argv.splice(2),
				i,
				key, val
			;

			for(i = 0; i < cliArgs.length; i+=2){
				key = cliArgs[i].toString().substring(2).toLowerCase();
				val = cliArgs[i+1].toString();
				if(validArgs.indexOf(key) !== -1){
					this._args[key] = val;
				}
			}

		},
		
		_checkCliArgs: function(){
			var err = '';
			err += (!this._args.basedir ? 'You should specify basedir (--basedir path/to/basedir)' : '');
			err += (!this._args.main ? 'You should specify main (--main path/to/main/relative/from/basedir.js)' : '');
			err += (!this._args.output ? 'You should specify output (--output path/to/output)' : '');
			if(!!err){
				throw new Error(err);
			}
		},
		
		_normalizePath: function(absoluteOrRelativePath){
			var testPath = path.normalize(absoluteOrRelativePath);
			if(!fs.existsSync(testPath)){
				testPath = path.normalize(__dirname + '/' + testPath);
				if(!fs.existsSync(testPath)){
					return false;
				}
			}
			return testPath;
		},
		
		build: function(){
			this._parseCliArgs();
			this._checkCliArgs();
			
			this._basePath = this._normalizePath(this._args.basedir);
			if(this._basePath === false){
				throw new Error('basedir path not found');
			}
			this._baseFile = path.basename(this._args.main);

			this._outputPath = this._normalizePath(this._args.output);
			if(this._outputPath === false){
				throw new Error('output path not found');
			}
			this._outputFile = path.normalize(
				this._outputPath + '/' + 
				path.basename(this._baseFile)
			);

			this._licenseFile = this._normalizePath(__dirname + '/LICENSE');

			this._mainFile = path.normalize(this._basePath + '/' + this._baseFile);
			
			this._writer = fs.createWriteStream(
				this._outputFile, { 
					flags: 'w',
					encoding: 'utf8',
					mode: parseInt(('666'), 8)
				}
			);
	
			var i;
			this._files = listDir(this._basePath, '.js');
			this._baseRJSId = '/__jasmine-durandal__/';
	
			this._writeHead();
			for(i = 0; i < this._files.length; i++){
				this._writeFile(this._files[i]);
			}
			this._writeMainFile();
			this._writeFoot();
		},
		
		_writeHead: function(){
			var license = '';
			if(this._licenseFile){
				license = '/*\n' + fs.readFileSync(this._licenseFile, {encoding: 'utf8'}) + '\n*/\n';
			}
			this._writer.write(license + '\n');
			this._writer.write('(function(){\n');
		},
		
		_writeFile: function(file){
			var baseName = path.basename(file);
			if(baseName !== this._baseFile){
				var fContent = fs.readFileSync(file, {encoding: 'utf8'}),
					base = this._baseRJSId + path.relative(file, this._basePath),
					rId = path.normalize(this._baseRJSId + '/' + base + '/' + baseName.replace('.js', '')).replace(/\\/g, '/');
				;
				fContent = fContent.replace('define([', 'define(\'' + rId + '\', [');
				fContent = this._fixFcontent(fContent, file);
				this._writer.write(fContent);
			}
		},
		_writeMainFile: function(){
			var fContent = fs.readFileSync(this._mainFile, {encoding: 'utf8'});
			
			fContent = this._fixFcontent(fContent, this._mainFile);
			this._writer.write(fContent);
		},

		_writeFoot: function(){
			this._writer.write('\n}());');
		},
		
		_fixFcontent: function(fContent, file){
			fContent = '\n'+ '// ** @file ' + file + '\n' + fContent + '\n';
			fContent = fContent.replace(/\'\.\//g, '\'' + this._baseRJSId);
			fContent = fContent.replace(/\n/g, '\n\t');
			return fContent;
		}

	};

	builder.build();

}());
