// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');
const ytdl = require('ytdl-core');
const moment = require('moment');
// const path = require('path');
// const fs = require('fs');

const convertBtn = $('.convert-button');
const URLinput = $('.url-input');
const descr = $('#descr');
const card = $('#card');


var mprogress = new Mprogress({
    template: 2,
    parent: '#mprogress'
});

function sendURL(URL, title, itag, ext) {
    let _data = {
        url: URL,
        title: title,
        itag: itag,
        ext: ext
    };
    ipcRenderer.send('data', _data);
}

convertBtn.click(() => {
    if (URLinput.val() == "") return false;
    sendURL(URLinput.val(), $('#title').text(), $('#formats').val(), $('option:selected').attr('name'));
});

let old;
URLinput.on('input', function() {
    clearTimeout();
    card.addClass('hidden');
    descr.addClass('hidden');
    if (old === $(this).val()) {
        card.removeClass('hidden');
        descr.removeClass('hidden');
    } else {
        mprogress.start();
        if (ytdl.validateURL($(this).val()) == true) {
            NProgress.start();
            NProgress.configure({
                minimum: 0.2
            });
            NProgress.inc(0.2);
            mprogress.set(0.3);
            mprogress.setBuffer(0.5);
            setTimeout(() => {
                ytdl.getInfo($(this).val(), (err, info) => {
                    if (err) {
                        $('#error-txt').text(err);
                        $('#error').removeClass('hidden');
                        setTimeout(() => {
                            $('#error').addClass('hidden');
                        }, 5000);
                        NProgress.done(true);
                        mprogress.end(true);
                        throw err;
                        return false;
                    }
                    mprogress.set(0.6);
                    mprogress.setBuffer(0.8);
                    let author = (info.author.name != undefined) ? info.author.name : "None";
                    let title = info.title != undefined ? info.title : info.player_response.videoDetails.title;
                    let description = info.description != undefined ? info.description : info.player_response.videoDetails.shortDescription;
                    //let chosenFormats = info.formats != undefined ? info.formats : info.player_response.streamingData.formats;
                    let chosenFormats = ytdl.filterFormats(info.formats, $('input:radio:checked')[0].id);
                    //let videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
                    //let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
                    let length = info.length_seconds != undefined ? Number(info.length_seconds / 60).toFixed(1) : Number(info.player_response.videoDetails.length_seconds / 60).toFixed(1);
                    let published = info.published
                    let avatar = info.author.avatar;
                    let thumbnails = info.player_response.videoDetails.thumbnail.thumbnails;
                    $('#title').text(title);
                    $('#author').text(author);
                    $('#avatar').attr("src", avatar);
                    $('#length').text(length);
                    $('#description').text(description);
                    $('#published').text(moment(published)._d);
                    $('#thumbnail').attr("style", `background: url(${thumbnails[0].url}); background-size: cover; background-repeat: no-repeat; background-position: center;`);
                    console.log();
                    $('#formats option').remove();
                    for (format of chosenFormats) {
                        if ($('input:radio:checked')[0].id == "audioonly") {
                            // $('#formats').append(`<option value="${format.itag}"> ${format.resolution} - ${format.container}`);
                            // $('#formats').append(new Option(`${format.resolution} - ${format.container}`, `${format.itag}`));
                            $('#formats').append($('<option>').val(`${format.itag}`).text(`${format.audioBitrate} kbps - ${format.container}`).attr('name', `${format.container}`));
                            $('#formats').prop('selectedIndex', 0);
                        } else {
                            // $('#formats').append(`<option value="${format.itag}"> ${format.resolution} - ${format.container}`);
                            // $('#formats').append(new Option(`${format.resolution} - ${format.container}`, `${format.itag}`));
                            $('#formats').append($('<option>').val(`${format.itag}`).text(`${format.resolution} - ${format.container}`).attr('name', `${format.container}`));
                            $('#formats').prop('selectedIndex', 0);
                        }
                    }
                    mprogress.set(0.8);
                    NProgress.done();
                    mprogress.setBuffer(1);
                    mprogress.end();
                    card.removeClass('hidden');
                    descr.removeClass('hidden');
                });
            }, 500);
        } else {
            let error = "Invalid URL, try another or check properly";
            $('#error-txt').text(error);
            $('#error').removeClass('hidden');
            setTimeout(() => {
                $('#error').addClass('hidden');
            }, 4000);
            console.log(error);
            NProgress.done(true);
            mprogress.end(true);
            return false;
        }
    }
    old = $(this).val();
});

$('input:radio').change(function() {
    if (URLinput.val() == "") return false;
    clearTimeout();
    card.addClass('hidden');
    descr.addClass('hidden');
    mprogress.start();
    if (ytdl.validateURL(URLinput.val()) == true) {
        NProgress.start();
        NProgress.configure({
            minimum: 0.2
        });
        NProgress.inc(0.2);
        mprogress.set(0.3);
        mprogress.setBuffer(0.5);
        setTimeout(() => {
            ytdl.getInfo(URLinput.val(), (err, info) => {
                if (err) {
                    $('#error-txt').text(err);
                    $('#error').removeClass('hidden');
                    setTimeout(() => {
                        $('#error').addClass('hidden');
                    }, 5000);
                    NProgress.done(true);
                    mprogress.end(true);
                    throw err;
                    return false;
                }
                mprogress.set(0.6);
                mprogress.setBuffer(0.8);
                let author = (info.author.name != undefined) ? info.author.name : "None";
                let title = info.title != undefined ? info.title : info.player_response.videoDetails.title;
                let description = info.description != undefined ? info.description : info.player_response.videoDetails.shortDescription;
                //let chosenFormats = info.formats != undefined ? info.formats : info.player_response.streamingData.formats;
                let chosenFormats = ytdl.filterFormats(info.formats, $('input:radio:checked')[0].id);
                //let videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
                //let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
                let length = info.length_seconds != undefined ? Number(info.length_seconds / 60).toFixed(1) : Number(info.player_response.videoDetails.length_seconds / 60).toFixed(1);
                let published = info.published
                let avatar = info.author.avatar;
                let thumbnails = info.player_response.videoDetails.thumbnail.thumbnails;
                //DO STUFF
                $('#title').text(title);
                $('#author').text(author);
                $('#avatar').attr("src", avatar);
                $('#length').text(length);
                $('#description').text(description);
                $('#published').text(moment(published)._d);
                $('#thumbnail').attr("style", `background: url(${thumbnails[0].url}); background-size: cover; background-repeat: no-repeat; background-position: center;`);
                console.log();
                $('#formats option').remove();
                for (format of chosenFormats) {
                    if ($('input:radio:checked')[0].id == "audioonly") {
                        // $('#formats').append(`<option value="${format.itag}"> ${format.resolution} - ${format.container}`);
                        // $('#formats').append(new Option(`${format.resolution} - ${format.container}`, `${format.itag}`));
                        $('#formats').append($('<option>').val(`${format.itag}`).text(`${format.audioBitrate} kbps - ${format.container}`).attr('name', `${format.container}`));
                        $('#formats').prop('selectedIndex', 0);
                    } else {
                        // $('#formats').append(`<option value="${format.itag}"> ${format.resolution} - ${format.container}`);
                        // $('#formats').append(new Option(`${format.resolution} - ${format.container}`, `${format.itag}`));
                        $('#formats').append($('<option>').val(`${format.itag}`).text(`${format.resolution} - ${format.container}`).attr('name', `${format.container}`));
                        $('#formats').prop('selectedIndex', 0);
                    }
                }
                mprogress.set(0.8);
                NProgress.done();
                mprogress.setBuffer(1);
                mprogress.end();
                card.removeClass('hidden');
                descr.removeClass('hidden');
            });
        }, 500);
    } else {
        let error = "Invalid URL, try another or check properly";
        $('#error-txt').text(error);
        $('#error').removeClass('hidden');
        setTimeout(() => {
            $('#error').addClass('hidden');
        }, 4000);
        console.log(error);
        NProgress.done(true);
        mprogress.end(true);
        return false;
    }
});

ipcRenderer.on('download', (event, args) => {
    console.log(args);
})
