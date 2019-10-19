const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(9000, () => {
	console.log('Server on 9000..');
});

app.get('/download', (req, res) => {
	let { URL, itag, title, ext } = req.query;
	let fileName = `${title} + '.' + ${ext}`;

	res.header('Content-Disposition', `attachment; filename=${fileName}`);
	res.header('Content-Type', 'video/mp4');

	ytdl(URL, {
		quality: itag
	}).pipe(res);

	// ytdl.getInfo(URL, (err, info) => {
	// 	if (err) {
	// 		console.error(err);
	// 		throw err;
	// 	} else {
	// 		let formats = ytdl.filterFormats(info.formats,  'audioandvideo');
	// 		let chosenFormat = formats.filter(object => object.itag === itag);
	// 		// let chosenFormat = formats.filter(object => { console.log(object.itag, itag); object.itag === itag });
	// 		let format = chosenFormat[0];

	// 		res.header('Content-Disposition', `attachment; filename=${fileName}`);
	// 		res.header('Content-Type', `${format.type}`);

	// 		ytdl(URL, {
	// 			format: format
	// 		}).pipe(res);
	// 		// }).pipe(fs.createWriteStream(name))
	// 		// res.json({ url: URL , itag: itag, title: title, ext: ext });
	// 	}
	// });
})

//jitsu wa watashi wa, lovely complex, orange, reLife, Bounen no Xamdou
