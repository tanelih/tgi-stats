'use strict'

var gulp       = require('gulp');
var less       = require('gulp-less');
var source     = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify   = require('reactify');
// var partialify = require('partialify');

gulp.task('img', function() {
	return gulp.src('./public/src/img/**/*.png')
		.pipe(gulp.dest('./public/dist/img/'));
});

gulp.task('less', function() {
	return gulp.src('./public/src/less/index.less')
		.pipe(less({
			'paths': ['./public/src/less/lib/']
		}))
		.pipe(gulp.dest('./public/dist/css/'));
});

gulp.task('browserify', function() {
	return browserify('./public/src/scripts/index.js')
		.transform(reactify).bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest('./public/dist/scripts/'));
});

gulp.task('build', ['img', 'less', 'browserify']);

gulp.task('default', ['build'], function() {
	gulp.watch('./public/src/img/**/*.png',     ['img']);
	gulp.watch('./public/src/less/**/*.less',   ['less']);
	gulp.watch('./public/src/scripts/**/*.js*', ['browserify']);
});
