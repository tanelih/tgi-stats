'use strict'

var gulp       = require('gulp');
var less       = require('gulp-less');
var source     = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('less', function() {
	return gulp.src('./public/src/less/index.less')
		.pipe(less({
			'paths': ['./bower_components/']
		}))
		.pipe(gulp.dest('./public/dist/css/'));
});

gulp.task('browserify', function() {
	return browserify('./public/src/js/index.js').bundle()
		.pipe(source('index.js'))
		.pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('build', ['less', 'browserify']);

gulp.task('default', ['build'], function() {
	gulp.watch('./public/src/js/**/*.js',     ['browserify']);
	gulp.watch('./public/src/less/**/*.less', ['less']);
});
