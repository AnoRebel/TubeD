const fileDownload = require('js-file-download');
const electron = require('electron');
const { ipcRenderer } = electron;
const { app } = electron.remote;
const remote = electron.remote;
// const fileSys = require('file-system');
// const fs = require('fs');

const dwnldBtn = $('.download-button');
const cancelBtn = $('.cancel-button');

//https://www.youtube.com/watch?v=dYRs7Q1vfYI
let data;
// console.log(app.getPath('downloads'))

ipcRenderer.on('download', (event, args) => {
	console.log(args)
	data = args;
	$('#fname').text(data['title'] + '.' + data['ext']);
})

dwnldBtn.click(() => {
	dwnldBtn.text('Downloading..');
	dwnldBtn.prop('disabled', true);
	Downloader.startDownload(data['url'], data['title'], data['itag'], data['ext']);
});

cancelBtn.click(() => {
	let win = remote.getCurrentWindow();
	win.close();
});

ipcRenderer.on('reply', (event, arg) => {
	console.log(arg);
})

'use strict'

function status({loaded, total}) {
	$('#status').text(Math.round(loaded/total*100) + '%');
}

function info(type, message) {
	if (type == 'error') {
		// $('#info').css('color', 'red')
		$('#info').addClass('text-red-500')
	} else if (type == 'info') {
		// $('#info').css('color', 'lightblue')
		$('#info').addClass('text-blue-500')
	} else if (type == 'success') {
		// $('#info').css('color', 'lightgreen')
		$('#info').addClass('text-green-500')
	} else {
		// $('#info').css('color', 'white')
		$('#info').addClass('text-white')
	}
	$('#info').text(message);
}

class FetchProgress {
	constructor(onProgress = function() {}) {
		this.onProgress = onProgress;
	}

	fetch(input, init = {}) {
		const request = (input instanceof Request)? input : new Request(input)
		this._cancelRequested = false;

		return fetch(request, init).then(response => {
			if(!response.body) {
				throw Error('ReadableStream is not yet supported.')
			}
			if(this._cancelRequested) {
				response.body.getReader().cancel();
				info('error', 'Cancel requested before server responded.');
				return Promise.reject('Cancel requested before server responded.');
			}
			if(!response.ok) {
				throw Error(`Server responded ${response.status} ${response.statusText}`);
			}

			const contentLength = response.headers.get('content-length');

			if (contentLength == null) {
				throw Error('Content-Length server response header missing.')
			}

			const total = parseInt(contentLength, 10);
			let loaded = 0;

			this._reader = response.body.getReader()
			const me = this;

			return new Response(
				new ReadableStream({
					start(controller) {
						if (me.cancelRequested) {
							console.warn('Cancelling read..')
							controller.close();
							return;
						}
						read();
						function read() {
							me._reader.read().then(({done, value}) => {
								if (done) {
									if (total === 0) {
										me.onProgress.call(me, {loaded, total});
									}
									controller.close();
									return;
								}
								loaded += value.byteLength;
								me.onProgress.call(me, {loaded, total});
								status({loaded, total})
								controller.enqueue(value);
								read();
							}).catch(error => {
								console.error(error);
								controller.error(error)
							});
						}
					}
				})
			)
		});
	}
	cancel() {
		console.info('Download cancel requested.')
		info('info', 'Download cancel requested.')
		this._cancelRequested = true;
		if (this._reader) {
			console.info('Cancelling current download..');
			return this._reader.cancel();
		}
		return Promise.resolve();
	}
}

const Downloader = (function() {
	const loader = $('#loader');
	const infoMsg = $('#loader .info');
	const status = $('#loader #status');
	const progress = $('#loader .progress');
	const loading = $('#loader .progress-bar');

	let locked, started, progressFetcher, pcnt, fileName;

	function doneDownload() {
		console.info('Done downloading.')
		info('success', 'Done downloading.');
		dwnldBtn.text('Download Again.');
		dwnldBtn.prop('disabled', false);
		loader.removeClass('loading');
		loader.addClass('loading-complete');
	}

	function startDownload(URL, title, itag, ext) {
		if (locked) {
			console.error('Failed to start the download since previous download not yet initialized.');
			info('error', 'Failed to download, previous download not yet initialized.');
			return;
		}
		locked = true;
		stopDownload()
		.then(function() {
			locked = false;
			progress.css('tranform', `scaleX(0)`);
			progress.outerWidth(); //prevents animation when set to zero
			started = true;
			pcnt = 0;
			loader.addClass('loading');
			loader.removeClass('loading-complete');

			if  (!progressFetcher) {
				progressFetcher = new FetchProgress(updateProgress);
			}

			console.info('Starting download...');
			info('info', 'Starting download...')
			fileName = `${title}` + '.' + `${ext}`;
			progressFetcher.fetch(`http://localhost:9000/download?URL=${URL}&title=${title}&itag=${itag}&ext=${ext}`, {
    			method: 'GET'
    		})
			.then(response => response.blob())
			.then(blob => fileDownload(blob, fileName))
			.then(_ => doneDownload())
			.catch(error => showError(error))
		});
	}

	function stopDownload() {
		if (progressFetcher) {
			dwnldBtn.text('Download')
			dwnldBtn.prop('disabled', false)
			return progressFetcher.cancel()
		} else {
			dwnldBtn.text('Download')
			dwnldBtn.prop('disabled', false)
			return Promise.resolve();
		}
	}

	function showError(error) {
		console.error(error);
		loader.removeClass('loading');
		loader.removeClass('loading-complete');
		loader.removeClass('loading-error');
		infoMsg.outerWidth();
		// errorMsg.text('ERROR: ' + error.message);
		info('error', error.message);
		loader.addClass('loading-error');
		dwnldBtn.text('Download')
		dwnldBtn.prop('disabled', false)
	}

	function updateProgress({loaded, total}) {
		if (!started) {
			loader.addClass('loading');
			started = true;
		}
		pcnt = total? loaded/total : 1;

		progress.css('tranform', `scaleX(${pcnt})`);

		if (loaded === total) {
			console.info('Download complete.')
		}
	}

	return {
		startDownload,
		stopDownload
	}
})()

// function downloader(URL, title, itag, ext) {
//     fetch(`http://localhost:9000/download?URL=${URL}&title=${title}&itag=${itag}&ext=${ext}`, {
//     	method: 'GET'
//     }).then(res => res.json())
//     .then(json => console.log(json));
//     // window.location.href = `https://localhost:6000/download?URL=${URL}`;
// }
